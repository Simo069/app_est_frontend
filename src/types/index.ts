export interface UserSelection {
  niveau: string;      // '1a' | '2a' | '3a'
  filiere: string;     // 'gi' | 'ge' | 'gc'
  niveauLabel: string; // 'BAC+1' | 'BAC+2' | 'LICENCE'
  filiereLabel: string; // 'Génie Informatique' | ...
}

export interface Niveau {
  id: string;
  label: string;      // 'BAC+1', 'BAC+2', 'LICENCE'
  value: string;      // '1a', '2a', '3a'
  description: string;
}

export interface Filiere {
  id: string;
  name: string;
  value: string;
  icon?: string;
}


