import { ScriptureSoftwareEngine } from './scripture-software-engine';
import { EasyWorship2009Engine } from './easyworship2009.engine';
import { EasyWorship6Engine } from './easyworship6.engine';
import { ProPresenterEngine } from './propresenter.engine';
import { SongShowPlusEngine } from './songshowplus.engine';
import { MediaShoutEngine } from './mediashout.engine';

export const ENGINE_REGISTRY: ScriptureSoftwareEngine[] = [
  EasyWorship2009Engine,
  EasyWorship6Engine,
  ProPresenterEngine,
  SongShowPlusEngine,
  MediaShoutEngine
];

export function getEngineById(id: string): ScriptureSoftwareEngine | undefined {
  return ENGINE_REGISTRY.find((e) => e.id === id);
}
