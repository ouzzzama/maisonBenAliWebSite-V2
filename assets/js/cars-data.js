/* Benali Cars — flotte de location.
   Source unique : la liste du marché (benali-cars) et la fiche véhicule
   (voiture-details) lisent ce fichier. Les modèles sont ceux proposés dans le
   formulaire de réservation du site. */
window.BENALI_CARS = [
  {
    slug: "dacia-duster",
    name: "Dacia Duster",
    category: "SUV",
    badge: "Le plus polyvalent",
    image: "assets/images/innerpage/cars/car-suv.webp",
    alt: "Dacia Duster blanc devant une villa d'Agadir",
    tagline: "SUV compact, à l'aise en ville comme sur la route de Taghazout.",
    description:
      "Le Duster est le compagnon idéal pour découvrir la baie d'Agadir sans se poser de questions : position de conduite haute, coffre généreux et vraie aisance sur les routes de campagne comme dans les ruelles de la médina. Un SUV simple, robuste et confortable pour un séjour ou une installation."
  },
  {
    slug: "peugeot-208",
    name: "Peugeot 208",
    category: "Citadine",
    badge: "La plus agile",
    image: "assets/images/innerpage/cars/car-compact.webp",
    alt: "Peugeot 208 grise sur une route d'Agadir",
    tagline: "Citadine agile et facile à garer, parfaite pour le centre d'Agadir.",
    description:
      "Compacte, sobre et maniable, la 208 se gare partout : Founty, Marina, centre-ville ou corniche. Son petit gabarit et sa consommation contenue en font la voiture la plus pratique pour les trajets quotidiens et les rendez-vous rapprochés."
  },
  {
    slug: "mercedes-classe-c",
    name: "Mercedes Classe C",
    category: "Berline",
    badge: "Le confort d'affaires",
    image: "assets/images/innerpage/cars/car-sedan.webp",
    alt: "Mercedes Classe C noire devant une résidence contemporaine",
    tagline: "Berline premium, silencieuse et confortable pour vos rendez-vous.",
    description:
      "La Classe C est la berline des arrivées soignées : sellerie soignée, insonorisation remarquable et tenue de route rassurante. Idéale pour les rendez-vous d'affaires, les visites de biens et les transferts avec clients à Agadir et Taghazout Bay."
  },
  {
    slug: "range-rover-evoque",
    name: "Range Rover Evoque",
    category: "SUV premium",
    badge: "L'arrivée signature",
    image: "assets/images/innerpage/cars/car-suv-premium.jpg",
    alt: "SUV premium bronze devant une villa blanche face à l'océan",
    tagline: "SUV premium au gabarit compact : présence et confort à bord.",
    description:
      "L'Evoque associe une silhouette reconnaissable à un intérieur raffiné. Position haute, visibilité généreuse et confort de haut niveau : c'est le véhicule que l'on choisit pour marquer une arrivée à l'aéroport Al Massira ou pour un séjour à Taghazout Bay."
  },
  {
    slug: "audi-a3",
    name: "Audi A3",
    category: "Compacte premium",
    badge: "L'équilibre premium",
    image: "assets/images/innerpage/cars/car-sportback.jpg",
    alt: "Audi A3 grise sur une route arborée",
    tagline: "Compacte premium : finitions soignées, conduite précise, coffre généreux.",
    description:
      "L'A3 offre le raffinement d'une allemande dans un format compact : conduite précise, finitions nettes et coffre suffisant pour les bagages d'un séjour. Un excellent compromis entre agilité en ville et confort sur les longs trajets côtiers."
  }
];

/* Prestations communes à toute la flotte (reprises des engagements Benali Cars). */
window.BENALI_CARS_SERVICES = [
  { icon: "fas fa-plane-arrival", text: "Livraison à l'aéroport Agadir Al Massira" },
  { icon: "fas fa-car-side", text: "Véhicules récents, entretenus et contrôlés" },
  { icon: "fas fa-key", text: "Pack combiné villa + voiture" }
];
