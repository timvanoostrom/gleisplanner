import { generateID } from '../helpers/app';
import type { Block, Blocks, GleisPlanned, GleisPropsPlanned } from 'src/types';
import { db } from './appConfig';
import { gleisPlanned, gleisPlannedDB, updateGleis } from './gleis';
import { derived, get } from 'svelte/store';
import { calculateTrackLengthCM } from '../helpers/geometry';

export const blocksDB = db<Blocks>('blocks', {});

export function createBlock(
  block: Omit<Block, 'id' | 'occupied' | 'reserved'>
) {
  const id = generateID();
  updateBlock({ ...block, id, occupied: false, reserved: false });
}

export function assignTo(
  blockId: Block['id'],
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

export function updateBlock(block: Partial<Block> & { id: Block['id'] }) {
  blocksDB.update((blocks) => {
    blocks[block.id] = {
      ...blocks[block.id],
      ...(block ?? {}),
    };
    return blocks;
  });
}

export function deleteBlock(id: Block['id']) {
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

export function getAssignedBlockByGleisId(id: GleisPropsPlanned['id']) {
  const gleis = get(gleisPlannedDB)[id];
  const blockId = gleis.blockId;
  const blocks = get(blocksDB);

  if (!blockId) {
    return null;
  }

  const block = blocks[blockId];

  return block;
}

const gleisPlannedByBlockId = derived(gleisPlanned, (gleisPlanned) => {
  const byBlockId: Record<Block['id'], GleisPropsPlanned[]> = {};
  for (const gleis of Object.values(gleisPlanned)) {
    if (gleis.blockId) {
      if (!byBlockId[gleis.blockId]) {
        byBlockId[gleis.blockId] = [gleis];
      } else {
        byBlockId[gleis.blockId].push(gleis);
      }
    }
  }
  return byBlockId;
});

export const blockEntriesExtended = derived(
  [blocksDB, gleisPlannedByBlockId],
  ([blocks, gleisPlannedByBlockId]) => {
    return Object.entries(blocks).map(([id, block]) => {
      const gleisAttached = gleisPlannedByBlockId[id] || [];
      return {
        ...block,
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
