import type { CampPlayer } from '@/types/camp';
import type { CampId } from '@/lib/camp-config';
import { createDefaultShotCampPlayers } from '@/data/shotCampPlayers';

/** Raw roster — bijnaam with duplicate disambiguation via last-name initial */
const ROSTER: { fullName: string; nickname: string }[] = [
  { fullName: 'Arthur Rozemulder', nickname: 'Arthur' },
  { fullName: 'Dann Onderdijk', nickname: 'Dann' },
  { fullName: 'Mees van Wersch', nickname: 'Mees' },
  { fullName: 'Stijn Langendoen', nickname: 'Stijn' },
  { fullName: 'Beau van der Reiden', nickname: 'Beau' },
  { fullName: 'Enzo Sergio Lobs Tanzarella', nickname: 'Enzo L' },
  { fullName: 'Bor de Wolf', nickname: 'Bor' },
  { fullName: 'Lars Rijke', nickname: 'Lars' },
  { fullName: 'Fayenne Mudde', nickname: 'Fayenne' },
  { fullName: 'Juliette Herweijer', nickname: 'Juliette' },
  { fullName: 'Flynn Wolterbeek', nickname: 'Flynn' },
  { fullName: 'Lukas Langendoen', nickname: 'Lukas' },
  { fullName: 'Casper den Haan', nickname: 'Casper' },
  { fullName: 'Raymond den Haan', nickname: 'Raymond' },
  { fullName: 'Riven Klein', nickname: 'Riven' },
  { fullName: 'Chazz Klein', nickname: 'Chazz' },
  { fullName: 'Hayden Klein', nickname: 'Hayden' },
  { fullName: 'Vinn de Bloeme', nickname: 'Vinn' },
  { fullName: 'Kai de Laat', nickname: 'Kai' },
  { fullName: 'Lasse de Laat', nickname: 'Lasse' },
  { fullName: 'Siem Timmerman', nickname: 'Siem' },
  { fullName: 'Celina Van der Veen', nickname: 'Celina' },
  { fullName: 'Kayleigh van der Veen', nickname: 'Kayleigh' },
  { fullName: 'Enzo Landman', nickname: 'Enzo La' },
  { fullName: 'Luc Vos', nickname: 'Luc' },
  { fullName: 'Sanne Dikmans', nickname: 'Sanne' },
  { fullName: 'Raúl Monfrooij', nickname: 'Raúl' },
  { fullName: 'Noa van Lankeren', nickname: 'Noa' },
  { fullName: 'Tijn van Wijk', nickname: 'Tijn W' },
  { fullName: 'Fay van Bogeriej', nickname: 'Fay' },
  { fullName: 'Lou van Bogerijen', nickname: 'Lou' },
  { fullName: 'Philou Spuijbroek Kievid', nickname: 'Philou' },
  { fullName: 'Olivia Spuijbroek Kievid', nickname: 'Olivia S' },
  { fullName: 'Esmee Weeda', nickname: 'Esmee' },
  { fullName: 'Niilo Baars', nickname: 'Niilo' },
  { fullName: 'Just Baars', nickname: 'Just' },
  { fullName: 'Sev Onderdijk', nickname: 'Sev' },
  { fullName: 'Jadie Menheere', nickname: 'Jadie' },
  { fullName: 'Naud Bal', nickname: 'Naud' },
  { fullName: 'Dieuwertje Meijer', nickname: 'Dieuwertje' },
  { fullName: 'Puck Wouters', nickname: 'Puck' },
  { fullName: 'Floor Kruit', nickname: 'Floor K' },
  { fullName: 'Senna Weeda', nickname: 'Senna' },
  { fullName: 'Benthe Steenbergen', nickname: 'Benthe' },
  { fullName: 'Thijm de Cocq', nickname: 'Thijm' },
  { fullName: 'Vince Frentzen', nickname: 'Vince' },
  { fullName: 'Julie Frentzen', nickname: 'Julie' },
  { fullName: 'Kaelynn Langbroek', nickname: 'Kaelynn' },
  { fullName: 'Dede van Nieuwenhoven', nickname: 'Dede' },
  { fullName: 'Jits Timmerman', nickname: 'Jits' },
  { fullName: 'Marie-Lou Klootwijk', nickname: 'Marie-Lou' },
  { fullName: 'Sophie Rozemulder', nickname: 'Sophie' },
  { fullName: 'Floris Vinks', nickname: 'Floris' },
  { fullName: 'Olivia van den Berg', nickname: 'Olivia v' },
  { fullName: 'Valerie van den Berg', nickname: 'Valerie' },
  { fullName: 'Lily van der Heijden', nickname: 'Lily' },
  { fullName: 'Vere Mol', nickname: 'Vere' },
  { fullName: 'Youp Dijkman', nickname: 'Youp' },
  { fullName: 'Tijn van Es', nickname: 'Tijn E' },
  { fullName: 'Georgina Jones', nickname: 'Georgina' },
  { fullName: 'Lewis van den Blink', nickname: 'Lewis' },
  { fullName: 'River Cornelius', nickname: 'River' },
  { fullName: 'Guusje Bots', nickname: 'Guusje' },
  { fullName: 'Sophie van de Kar', nickname: 'Sophie v' },
  { fullName: 'Jelte Zwolle', nickname: 'Jelte' },
];

export function createDefaultCampPlayers(): CampPlayer[] {
  return ROSTER.map((p, i) => ({
    id: `camp-p${i + 1}`,
    fullName: p.fullName,
    nickname: p.nickname,
    groupId: null,
  }));
}

export function createDefaultPlayersForCamp(campId: CampId): CampPlayer[] {
  return campId === 'shot' ? createDefaultShotCampPlayers() : createDefaultCampPlayers();
}

export const CAMP_PLAYER_COUNT = ROSTER.length;
