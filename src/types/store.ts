export type StoreAddress = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  full: string;
  mapsQuery: string;
};

export type StoreFounder = {
  name: string;
  role: string;
  bio: string;
  shortBio: string;
};

export type StoreValue = {
  title: string;
  text: string;
};

export type StoreHours = {
  days: string;
  time: string;
};

export type StoreInfo = {
  name: string;
  legalName: string;
  cnpj: string;
  slogan: string;
  founder: StoreFounder;
  story: string;
  values: StoreValue[];
  differentials: string[];
  address: StoreAddress;
  phone: string;
  phoneE164: string;
  email: string;
  instagram: string;
  instagramHandle: string;
  hours: StoreHours[];
  openedAt: string;
};
