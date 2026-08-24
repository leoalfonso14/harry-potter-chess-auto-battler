import { UNITS, TRAITS } from '@autobattler/shared';
import { Texture, Assets } from 'pixi.js';

export const UNIT_PORTRAIT_URLS: Record<string, string> = {
  acromantula_hatchling: '/units/acromantula_hatchling.jpg',
  albus_dumbledore: '/units/albus_dumbledore.jpg',
  argus_filch: '/units/argus_filch.jpg',
  bellatrix_lestrange: '/units/bellatrix_lestrange.jpg',
  bowtruckle: '/units/bowtruckle.jpg',
  buckbeak: '/units/buckbeak.jpg',
  cedric_diggory: '/units/cedric_diggory.jpg',
  cho_chang: '/units/cho_chang.jpg',
  colin_creevey: '/units/colin_creevey.jpg',
  cornish_pixie: '/units/cornish_pixie.jpg',
  dean_thomas: '/units/dean_thomas.jpg',
  dobby: '/units/dobby.jpg',
  dolores_umbridge: '/units/dolores_umbridge.jpg',
  draco_malfoy: '/units/draco_malfoy.jpg',
  fawkes: '/units/fawkes.jpg',
  filius_flitwick: '/units/filius_flitwick.jpg',
  firenze: '/units/firenze.jpg',
  fleur_delacour: '/units/fleur_delacour.jpg',
  fred_and_george: '/units/fred_and_george.jpg',
  gabrielle_delacour: '/units/gabrielle_delacour.jpg',
  garden_gnome: '/units/garden_gnome.jpg',
  gellert_grindelwald: '/units/gellert_grindelwald.jpg',
  ginny_weasley: '/units/ginny_weasley.jpg',
  godric_gryffindor: '/units/godric_gryffindor.jpg',
  gregory_goyle: '/units/gregory_goyle.jpg',
  hannah_abbott: '/units/hannah_abbott.jpg',
  harry_potter: '/units/harry_potter.jpg',
  helga_hufflepuff: '/units/helga_hufflepuff.jpg',
  hermione_granger: '/units/hermione_granger.jpg',
  horace_slughorn: '/units/horace_slughorn.jpg',
  hungarian_horntail: '/units/hungarian_horntail.jpg',
  igor_karkaroff: '/units/igor_karkaroff.jpg',
  kreacher: '/units/kreacher.jpg',
  lord_voldemort: '/units/lord_voldemort.jpg',
  lucius_malfoy: '/units/lucius_malfoy.jpg',
  luna_lovegood: '/units/luna_lovegood.jpg',
  madame_maxime: '/units/madame_maxime.jpg',
  madeye_moody: '/units/madeye_moody.jpg',
  minerva_mcgonagall: '/units/minerva_mcgonagall.jpg',
  moaning_myrtle: '/units/moaning_myrtle.jpg',
  molly_weasley: '/units/molly_weasley.jpg',
  narcissa_malfoy: '/units/narcissa_malfoy.jpg',
  nearly_headless_nick: '/units/nearly_headless_nick.jpg',
  neville_longbottom: '/units/neville_longbottom.jpg',
  newt_scamander: '/units/newt_scamander.jpg',
  niffler: '/units/niffler.jpg',
  nymphadora_tonks: '/units/nymphadora_tonks.jpg',
  padma_patil: '/units/padma_patil.jpg',
  pansy_parkinson: '/units/pansy_parkinson.jpg',
  parvati_patil: '/units/parvati_patil.jpg',
  poliakoff: '/units/poliakoff.jpg',
  professor_sprout: '/units/professor_sprout.jpg',
  remus_lupin: '/units/remus_lupin.jpg',
  ron_weasley: '/units/ron_weasley.jpg',
  rowena_ravenclaw: '/units/rowena_ravenclaw.jpg',
  rubeus_hagrid: '/units/rubeus_hagrid.jpg',
  salazar_slytherin: '/units/salazar_slytherin.jpg',
  severus_snape: '/units/severus_snape.jpg',
  sirius_black: '/units/sirius_black.jpg',
  susan_bones: '/units/susan_bones.jpg',
  sybill_trelawney: '/units/sybill_trelawney.jpg',
  the_bloody_baron: '/units/the_bloody_baron.jpg',
  the_fat_friar: '/units/the_fat_friar.jpg',
  the_grey_lady: '/units/the_grey_lady.jpg',
  thestral: '/units/thestral.jpg',
  viktor_krum: '/units/viktor_krum.jpg',
  vincent_crabbe: '/units/vincent_crabbe.jpg',
  winky: '/units/winky.jpg',
};

const UNIT_ICONS: Record<string, string> = {
  neville_longbottom: '🌱',
  colin_creevey: '📷',
  draco_malfoy: '🐍',
  vincent_crabbe: '🥊',
  gregory_goyle: '🛡️',
  luna_lovegood: '👓',
  cho_chang: '🦅',
  hannah_abbott: '🌼',
  susan_bones: '🛡️',
  dobby: '🧦',
  winky: '🫖',
  bowtruckle: '🌿',
  niffler: '🪙',
  poliakoff: '🥊',
  gabrielle_delacour: '✨',
  moaning_myrtle: '💧',
  ron_weasley: '♟️',
  hermione_granger: '📚',
  ginny_weasley: '🏹',
  dean_thomas: '🦁',
  pansy_parkinson: '🥀',
  kreacher: '🗝️',
  padma_patil: '✨',
  parvati_patil: '🏹',
  cedric_diggory: '🏆',
  professor_sprout: '🪴',
  nearly_headless_nick: '👻',
  viktor_krum: '⚡',
  fleur_delacour: '🦋',
  firenze: '🏹',
  harry_potter: '⚡',
  fred_and_george: '🎆',
  narcissa_malfoy: '✨',
  sirius_black: '🐕',
  bellatrix_lestrange: '🗡️',
  horace_slughorn: '🏺',
  filius_flitwick: '🪄',
  the_grey_lady: '👑',
  remus_lupin: '🐺',
  nymphadora_tonks: '🦚',
  the_fat_friar: '🕯️',
  igor_karkaroff: '⚓',
  rubeus_hagrid: '🪓',
  buckbeak: '🦅',
  minerva_mcgonagall: '🐈',
  severus_snape: '🧪',
  lucius_malfoy: '🦯',
  molly_weasley: '🧶',
  the_bloody_baron: '⛓️',
  sybill_trelawney: '🔮',
  newt_scamander: '🧳',
  madeye_moody: '👁️',
  gellert_grindelwald: '🔮',
  madame_maxime: '🏰',
  thestral: '🐎',
  godric_gryffindor: '🗡️',
  salazar_slytherin: '🐍',
  rowena_ravenclaw: '🦅',
  helga_hufflepuff: '🦡',
  albus_dumbledore: '🧙‍♂️',
  lord_voldemort: '💀',
  fawkes: '🔥',
  hungarian_horntail: '🐉',
  cornish_pixie: '🧚',
  garden_gnome: '🍄',
  acromantula_hatchling: '🕷️',
  argus_filch: '🗝️',
  dolores_umbridge: '🎀',
};

export function getUnitIcon(unitId: string): string {
  return UNIT_ICONS[unitId] || '🪄';
}

export function getUnitPortraitUrl(unitId: string): string {
  return UNIT_PORTRAIT_URLS[unitId] || `/units/${unitId}.jpg`;
}

export function hasUnitImage(unitId: string): boolean {
  return Boolean(UNIT_PORTRAIT_URLS[unitId]);
}

// In-memory cache for PIXI Textures
const textureCache: Map<string, Texture> = new Map();

/**
 * Returns preloaded texture synchronously if cached
 */
export function getUnitTextureSync(unitId: string): Texture | null {
  return textureCache.get(unitId) || null;
}

/**
 * Loads or retrieves a unit portrait texture for PIXI canvas rendering
 */
export async function getUnitTexture(unitId: string): Promise<Texture | null> {
  if (textureCache.has(unitId)) {
    return textureCache.get(unitId)!;
  }

  const url = getUnitPortraitUrl(unitId);
  try {
    const tex = await Assets.load(url);
    if (tex) {
      textureCache.set(unitId, tex);
      return tex;
    }
  } catch {
    // If specific file not found, return null
  }
  return null;
}

/**
 * Preloads all available unit portrait textures into PIXI cache
 */
export async function preloadAllUnitTextures(): Promise<void> {
  const promises = Object.entries(UNIT_PORTRAIT_URLS).map(async ([id, url]) => {
    if (textureCache.has(id)) return;
    try {
      const tex = await Assets.load(url);
      if (tex) {
        textureCache.set(id, tex);
      }
    } catch {
      // Ignored
    }
  });
  await Promise.allSettled(promises);
}
