import type {
  Block,
  Blocks,
  GleisPropsPlanned,
  Point,
  Section,
  Sections,
} from 'src/types';
import { derived, get, writable } from 'svelte/store';
import { svgPathProperties } from 'svg-path-properties';
import { generateID } from '../helpers/app';
import { calculateTrackLengthCM } from '../helpers/geometry';
import { findSegment } from '../helpers/gleis';
import { db } from './appConfig';
import type { LinkedRoute, LocoRoutes } from './gleis';
import {
  gleisBezetz,
  gleisPlanned,
  gleisPlannedAll,
  gleisPlannedDB,
  gleisPlannedSelected,
  pointConnections,
  updateGleis,
} from './gleis';
import { layersById } from './layerControl';
import type { Loco } from './workspace';
import { updateLoco } from './workspace';

export const blocksDB = db<Blocks>('blocks', {});
export const sectionsDB = db<Sections>('sections', {});

export const sectionIdsSelected = writable([]);

export const isSectionsChain = derived(
  [gleisPlannedDB, sectionIdsSelected, pointConnections],
  ([gleisPlanned, sectionIdsSelected, pointConnections]) => {
    if (sectionIdsSelected.length >= 1) {
      const gleisInSection = Object.entries(gleisPlanned).filter(([, gleis]) =>
        sectionIdsSelected.includes(gleis?.sectionId)
      );

      const pointIndex = [];
      for (const [, gleis] of gleisInSection) {
        const pathSegmentPoints = gleis.pathSegments
          .filter((segment) => segment.type === 'main')
          .flatMap((segment) => segment.points);
        pointIndex.push(Array.from(new Set(pathSegmentPoints)));
      }

      console.log('pointIndex:', pointIndex);
      const allFlat = pointIndex.flatMap((p) => p);
      const isOk = pointIndex.every((points) => {
        const blap = 'bliep';
      });
      // let i = 0;
      // for (const segmentPoints of pointIndex) {
      //   switch (segmentPoints.length) {
      //     case 2:
      //       // Flex, straight, curve
      //       break;
      //     case 3:
      //       // Turnout
      //       break;
      //     case 4:
      //       // Crossing or Threeway
      //       // TODO: implement
      //       break;
      //   }
      //   i += 1;
      // }

      const gleisChained = gleisInSection;

      return gleisChained.length === gleisInSection.length;
    }
    return false;
  }
);

export const hasMultipleSectionsSelected = derived(
  gleisPlannedSelected,
  (gleis) => {
    const sectionIds = new Set(gleis.filter(({ sectionId }) => sectionId));
    return sectionIds.size > 1;
  }
);

export const hasSectionsAssigned = derived(gleisPlannedSelected, (gleis) => {
  return gleis.some((gleis) => !!gleis.sectionId);
});

export const hasBlocksAssigned = derived(
  [sectionIdsSelected, sectionsDB],
  ([ids, sections]) => {
    return ids.some((id) => !!sections[id].blockId);
  }
);

export const blocksBySectionId = derived(
  [blocksDB, sectionsDB],
  ([blocks, sections]) => {
    const blocksBySectionId = {};
    const blocksWithOccupation = {};

    for (const [id, section] of Object.entries(sections)) {
      if (section.blockId) {
        let block = blocksWithOccupation[section.blockId];

        if (!block) {
          block = blocksWithOccupation[section.blockId] = {
            ...blocks[section.blockId],
            occupied: section.isActivated,
          };
        } else {
          block.occupied = section.isActivated;
        }

        blocksBySectionId[id] = block;
      }
    }

    console.log('blocksBySectionId!!', blocksBySectionId);

    return blocksBySectionId;
  }
);

export const sectionsByBlockId = derived(sectionsDB, (sections) => {
  const sectionsByBlockId: Record<Block['id'], Section[]> = {};
  for (const [sectionID, section] of Object.entries(sections)) {
    if (section.blockId && !sectionsByBlockId[section.blockId]) {
      sectionsByBlockId[section.blockId] = [];
    }
    if (section.blockId) {
      sectionsByBlockId[section.blockId].push(section);
    }
  }
  return sectionsByBlockId;
});

export const gleisBySectionId = derived(gleisPlannedAll, (gleisPlanned) => {
  const gleisBySectionId: Record<Section['id'], GleisPropsPlanned[]> = {};
  for (const gleis of gleisPlanned) {
    if (gleis.sectionId && !gleisBySectionId[gleis.sectionId]) {
      gleisBySectionId[gleis.sectionId] = [];
    }
    if (gleis.sectionId) {
      gleisBySectionId[gleis.sectionId].push(gleis);
    }
  }
  return gleisBySectionId;
});

export const gleisByBlockId = derived(
  [gleisBySectionId, sectionsByBlockId],
  ([gleisBySectionId, sectionsByBlockId]) => {
    const gleisByBlockId: Record<Block['id'], GleisPropsPlanned[]> = {};
    for (const [blockId, sections] of Object.entries(sectionsByBlockId)) {
      gleisByBlockId[blockId] = sections.flatMap(
        (section) => gleisBySectionId[section.id]
      );
    }
    return gleisByBlockId;
  }
);

export function createSection(section: Omit<Section, 'id' | 'isActivated'>) {
  const id = generateID();
  const sectionInsert: Section = { ...section, id, isActivated: false };
  updateSection(sectionInsert);
  return sectionInsert;
}

export function selectSection(id: Section['id'], single: boolean = true) {
  sectionIdsSelected.update((ids) => {
    if (ids.includes(id)) {
      return single ? [] : ids.filter((sid) => sid !== id);
    }
    return single ? [id] : [...ids, id];
  });
}

export function toggleSection(gleisIds: Array<GleisPropsPlanned['id']>) {
  if (get(hasMultipleSectionsSelected)) {
    alert('Cannot operate multiple sections at the same time.');
    return;
  }

  const gleis = get(gleisPlannedDB);

  const gleisSelected = gleisIds.map((id) => {
    return gleis[id];
  });

  const gleisWithSection = gleisSelected.filter((gleis) => {
    return !!gleis?.sectionId;
  });

  if (gleisWithSection.length) {
    if (confirm('Remove all attached sections?')) {
      for (const { sectionId } of gleisWithSection) {
        deleteSection(sectionId);
      }
      updateGleis(
        gleisWithSection.map(({ id }) => {
          return {
            id,
            sectionId: undefined,
          };
        })
      );
    }
  } else {
    const sectionPath = gleisSelected
      .map((gleis) =>
        gleis.pathSegments.find((p) => p.type === 'main').d.toString()
      )
      .join('');
    const svgPath = new svgPathProperties(sectionPath);
    const symbolAtPoint = svgPath.getPointAtLength(
      svgPath.getTotalLength() / 2
    );
    const title =
      'Section ' + gleisSelected.map((gleis) => gleis.type).join('-');
    const section = createSection({ symbolAtPoint, title });

    updateGleis(
      gleisIds.map((id) => {
        return {
          id,
          sectionId: section.id,
        };
      })
    );

    selectSection(section.id);
  }
}

export function addTo(
  sectionId: Section['id'],
  gleisIds: Array<GleisPropsPlanned['id']>
) {
  updateGleis(
    gleisIds.map((id) => {
      return {
        id,
        sectionId,
      };
    })
  );
}

export function updateSection(
  section: Partial<Section> & { id: Section['id'] }
) {
  sectionsDB.update((sections) => {
    sections[section.id] = {
      ...sections[section.id],
      ...(section ?? {}),
    };
    return sections;
  });
}

export function deleteSection(id: Section['id']) {
  let blockId: string = '';

  sectionsDB.update((sections) => {
    blockId = sections[id].blockId;
    delete sections[id];

    const sectionsInThisBlock = Object.values(sections).filter((section) => {
      return section.blockId === blockId;
    });

    if (sectionsInThisBlock.length === 0) {
      blocksDB.update((blocks) => {
        delete blocks[blockId];
        return blocks;
      });
    }

    return sections;
  });

  sectionIdsSelected.update((sectionIdsSelected) => {
    return sectionIdsSelected.filter((sid) => {
      return id !== sid;
    });
  });

  const sectionIds = Object.keys(get(sectionsDB));

  gleisPlannedDB.update((gleisPlanned) => {
    for (const [id, gleisPropsPlanned] of Object.entries(gleisPlanned)) {
      if (
        gleisPropsPlanned.sectionId === id ||
        (gleisPropsPlanned.sectionId &&
          !sectionIds.includes(gleisPropsPlanned.sectionId))
      ) {
        delete gleisPropsPlanned.sectionId;
      }
    }
    return gleisPlanned;
  });
}

export function getAssignedSectionByGleisId(id: GleisPropsPlanned['id']) {
  const gleis = get(gleisPlannedDB)[id];
  const sectionId = gleis.sectionId;
  const sections = get(sectionsDB);

  if (!sectionId) {
    return null;
  }

  const section = sections[sectionId];

  return section;
}

const gleisPlannedBySectionId = derived(gleisPlanned, (gleisPlanned) => {
  const bySectionId: Record<Section['id'], GleisPropsPlanned[]> = {};
  for (const gleis of Object.values(gleisPlanned)) {
    if (gleis.sectionId) {
      if (!bySectionId[gleis.sectionId]) {
        bySectionId[gleis.sectionId] = [gleis];
      } else {
        bySectionId[gleis.sectionId].push(gleis);
      }
    }
  }
  return bySectionId;
});

export const sectionEntriesExtended = derived(
  [sectionsDB, gleisPlannedBySectionId, blocksDB],
  ([sections, gleisPlannedBySectionId, blocksDB]) => {
    return Object.entries(sections).map(([id, section]) => {
      const gleisAttached = gleisPlannedBySectionId[id] || [];
      return {
        ...section,
        blockTitle: blocksDB[section.blockId]?.title || section.blockId,
        gleisAttached,
        totalLength: gleisAttached.reduce((acc, gleis) => {
          return (
            acc +
            calculateTrackLengthCM(
              gleis.pathSegments.find((segment) => segment.type === 'main')
            )
          );
        }, 0),
      };
    });
  }
);

export function assignBlock() {
  const sections = get(sectionsDB);
  const sectionIds = get(sectionIdsSelected);
  const assignedBlockIds = Array.from(
    new Set(
      sectionIds
        .map((id) => {
          return sections[id]?.blockId;
        })
        .filter((x) => !!x)
    )
  );

  console.log('assignedBlockIds', assignedBlockIds.length);

  if (assignedBlockIds.length >= 2) {
    alert('noooooo, dunno which block to take.');
  } else {
    const existingBlockId = assignedBlockIds[0];
    const blockId = existingBlockId || generateID();

    const allSectionsInBlock = Object.entries(sections).filter(
      ([id, section]) => section.blockId === blockId
    );

    if (!existingBlockId) {
      // TODO: Create new Block
      const gleis = get(gleisPlannedDB);
      const layerIds = Array.from(
        new Set(
          Object.entries(gleis)
            .filter(([id, gleis]) => {
              return sectionIds.includes(gleis.sectionId);
            })
            .map(([, gleis]) => gleis.layerId)
        )
      );

      const layerName = Object.entries(get(layersById))
        .filter(([id, layer]) => layerIds.includes(id))
        .map(([id, layer]) => layer.name)
        .join(' ');

      const blocksWithLayerName: string[] = Object.entries(get(blocksDB))
        .filter(([id, block]) => block.title.includes(layerName))
        .map(([, block]) => block.title);

      const nextNumber = Math.max(
        ...blocksWithLayerName.map(
          (name) => parseInt(name.replace(/[^0-9]/g, ''), 10) + 1
        ),
        1
      );

      const nextName = `${layerName} ${nextNumber}`;

      blocksDB.update((blocks) => {
        blocks[blockId] = {
          title: nextName,
          id: blockId,
        };
        return blocks;
      });
    }

    if (sectionIds.length === allSectionsInBlock.length) {
      // Remove blockIds
      // TODO: Remove block
      sectionsDB.update((sections) => {
        for (const id of sectionIds) {
          delete sections[id].blockId;
        }
        return sections;
      });
    } else {
      sectionsDB.update((sections) => {
        for (const id of sectionIds) {
          sections[id] = {
            ...sections[id],
            blockId,
          };
        }
        return sections;
      });
    }
  }
  // blocksDB.update((blocks) => {
  //   return blocks;
  // });
}

export function stopLoco(locoID: Loco['id']) {
  updateLoco(locoID, { velocity: 0 });
}

export function startLoco(locoID: string) {
  updateLoco(locoID, { velocity: 1 });
}

export function resetRoutes(
  locoID: string,
  withUpdatePayload?: Partial<LocoRoutes>
) {
  gleisBezetz.update((gleisBezetz) => {
    gleisBezetz[locoID] = {
      ...gleisBezetz[locoID],
      ...withUpdatePayload,
    };
    gleisBezetz[locoID].routes = {};
    gleisBezetz[locoID].activeRouteId = '';
    return gleisBezetz;
  });
}

export function setLocoAtPoint(locoID: string, point: Point | null) {
  updateLoco(locoID, { atPoint: point });
}

export function getBezetzSegment(
  currentLinkIndex: number,
  linkedRoute: LinkedRoute
) {
  const fromLink = linkedRoute[currentLinkIndex];
  const toLink = linkedRoute[currentLinkIndex + 1];

  if (fromLink && toLink) {
    const [, , fromPoint, from] = fromLink;
    const [, , toPoint, to] = toLink || [];
    return findSegment(from, fromPoint, toPoint);
  }

  return '';
}

export const previewControlRoute = writable<string[]>([]);

window.cleanSections = () => {
  const sections = get(sectionsDB);

  let sectionIdsAssigned = [];

  gleisPlannedDB.update((gleisPlanned) => {
    for (const [id, gleis] of Object.entries(gleisPlanned)) {
      if (gleis.sectionId && !sections[gleis.sectionId]) {
        delete gleis.sectionId;
      } else {
        sectionIdsAssigned.push(gleis.sectionId);
      }
    }
    return gleisPlanned;
  });

  const blockIdsFoundAtSections = [];

  sectionsDB.update((sectionsDB) => {
    for (const [id, section] of Object.entries(sectionsDB)) {
      if (!sectionIdsAssigned.includes(id)) {
        delete sectionsDB[id];
      } else if (section.blockId) {
        blockIdsFoundAtSections.push(section.blockId);
      }
    }
    return sectionsDB;
  });

  blocksDB.update((blocksDB) => {
    for (const [id, block] of Object.entries(blocksDB)) {
      if (!blockIdsFoundAtSections.includes(id)) {
        delete blocksDB[id];
      }
    }
    return blocksDB;
  });
};
