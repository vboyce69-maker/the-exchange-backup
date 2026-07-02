export interface SafeZone {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
}

export const SAFE_ZONES: SafeZone[] = [
  // Cape Town
  { id: "bellville-saps", label: "Bellville SAPS", address: "Voortrekker Rd, Bellville", lat: -33.8998, lng: 18.6306, city: "Cape Town" },
  { id: "claremont-saps", label: "Claremont SAPS", address: "Lansdowne Rd, Claremont", lat: -33.9849, lng: 18.4677, city: "Cape Town" },
  { id: "mitchells-plain-saps", label: "Mitchells Plain SAPS", address: "AZ Berman Dr, Mitchells Plain", lat: -34.0484, lng: 18.6148, city: "Cape Town" },
  { id: "wynberg-saps", label: "Wynberg SAPS", address: "Maynard St, Wynberg", lat: -34.0042, lng: 18.4681, city: "Cape Town" },
  { id: "kuils-river-saps", label: "Kuils River SAPS", address: "Van Riebeeck Rd, Kuils River", lat: -33.9333, lng: 18.6833, city: "Cape Town" },
  { id: "bishop-lavis-saps", label: "Bishop Lavis SAPS", address: "Voorbrug Dr, Bishop Lavis", lat: -33.9500, lng: 18.5833, city: "Cape Town" },
  { id: "strand-saps", label: "Strand SAPS", address: "Dynaamiet St, Strand", lat: -34.1167, lng: 18.8333, city: "Cape Town" },
  { id: "goodwood-saps", label: "Goodwood SAPS", address: "Jan van Riebeeck Dr, Goodwood", lat: -33.9000, lng: 18.5500, city: "Cape Town" },
  // Johannesburg
  { id: "sandton-saps", label: "Sandton SAPS", address: "West St, Sandton", lat: -26.1076, lng: 28.0567, city: "Johannesburg" },
  { id: "soweto-saps", label: "Soweto (Moroka) SAPS", address: "Moroka, Soweto", lat: -26.2485, lng: 27.8738, city: "Johannesburg" },
  // Pretoria
  { id: "pretoria-central-saps", label: "Pretoria Central SAPS", address: "Pretorius St, Pretoria", lat: -25.7479, lng: 28.1878, city: "Pretoria" },
  // Durban
  { id: "durban-central-saps", label: "Durban Central SAPS", address: "Anton Lembede St, Durban", lat: -29.8587, lng: 31.0218, city: "Durban" },
];
