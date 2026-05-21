import animalImages from "@/data/animal-images.json";

export type AnimalCatalogItem = {
  id: string;
  labelTh: string;
  labelEn: string;
  image: string;
};

const catalog = (animalImages.animals || []) as AnimalCatalogItem[];

export function getAnimalImageCatalog(): AnimalCatalogItem[] {
  return catalog;
}

export function getAnimalById(id: string): AnimalCatalogItem | undefined {
  return catalog.find((animal) => animal.id === id);
}

export function getAnimalImageById(id: string, fallback = ""): string {
  return getAnimalById(id)?.image || fallback;
}

export function getAnimalByEnglishName(name: string): AnimalCatalogItem | undefined {
  const normalized = name.trim().toLowerCase();
  return catalog.find((animal) => animal.labelEn.toLowerCase() === normalized);
}

export function getAnimalImageByEnglishName(name: string, fallback = ""): string {
  return getAnimalByEnglishName(name)?.image || fallback;
}
