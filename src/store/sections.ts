import { generateID } from '../helpers/app';
import type {
  Section,
  Sections,
  GleisPlanned,
  GleisPropsPlanned,
} from 'src/types';
import { db } from './appConfig';
import { gleisPlanned, gleisPlannedDB, updateGleis } from './gleis';
import { derived, get } from 'svelte/store';
import { calculateTrackLengthCM } from '../helpers/geometry';

export const blocksDB = db<Sections>('blocks', {});

export function createSection(
  section: Omit<Section, 'id' | 'occupied' | 'reserved'>
) {
  const id = generateID();
  updateSection({ ...section, id, occupied: false, reserved: false });
}

export function addTo(
  blockId: Section['id'],
  gleisIds: Array<GleisPropsPlanned['id']>
) {
  updateGleis(
    gleisIds.map((id) => {
      return {
        id,
        blockId,
      };
    })
  );
}

export function updateSection(
  section: Partial<Section> & { id: Section['id'] }
) {
  blocksDB.update((blocks) => {
    blocks[section.id] = {
      ...blocks[section.id],
      ...(section ?? {}),
    };
    return blocks;
  });
}

export function deleteSection(id: Section['id']) {
  blocksDB.update((blocks) => {
    delete blocks[id];
    return blocks;
  });
  const blockIds = Object.keys(get(blocksDB));
  gleisPlannedDB.update((gleisPlanned) => {
    for (const [id, gleisPropsPlanned] of Object.entries(gleisPlanned)) {
      if (
        gleisPropsPlanned.blockId === id ||
        (gleisPropsPlanned.blockId &&
          !blockIds.includes(gleisPropsPlanned.blockId))
      ) {
        delete gleisPropsPlanned.blockId;
      }
    }
    return gleisPlanned;
  });
}

export function getAssignedSectionByGleisId(id: GleisPropsPlanned['id']) {
  const gleis = get(gleisPlannedDB)[id];
  const blockId = gleis.blockId;
  const blocks = get(blocksDB);

  if (!blockId) {
    return null;
  }

  const section = blocks[blockId];

  return section;
}

const gleisPlannedBySectionId = derived(gleisPlanned, (gleisPlanned) => {
  const bySectionId: Record<Section['id'], GleisPropsPlanned[]> = {};
  for (const gleis of Object.values(gleisPlanned)) {
    if (gleis.blockId) {
      if (!bySectionId[gleis.blockId]) {
        bySectionId[gleis.blockId] = [gleis];
      } else {
        bySectionId[gleis.blockId].push(gleis);
      }
    }
  }
  return bySectionId;
});

export const blockEntriesExtended = derived(
  [blocksDB, gleisPlannedBySectionId],
  ([blocks, gleisPlannedBySectionId]) => {
    return Object.entries(blocks).map(([id, section]) => {
      const gleisAttached = gleisPlannedBySectionId[id] || [];
      return {
        ...section,
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
