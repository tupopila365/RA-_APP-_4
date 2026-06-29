function getVehicleStatus(expiryDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(expiryDate);
  const threeMonthsAhead = new Date(today);
  threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

  if (due < today) return 'expired';
  if (due <= threeMonthsAhead) return 'due-soon';
  return 'valid';
}

export const REGISTERED_VEHICLES = [
  {
    id: 'vehicle-1',
    make: 'TOYOTA',
    model: 'HILUX 2.8 GD-6',
    licenceNumber: 'N 94821W',
    registerNumber: 'N94821W',
    chassisNumber: 'AHTBA3CD907441562',
    licenceExpiryDate: '2026-06-18',
  },
  {
    id: 'vehicle-2',
    make: 'VOLKSWAGEN',
    model: 'POLO VIVO 1.4',
    licenceNumber: 'N 12345A',
    registerNumber: 'N12345A',
    chassisNumber: 'AAVZZZ6RZHU012345',
    licenceExpiryDate: '2026-03-15',
  },
].map((vehicle) => ({
  ...vehicle,
  status: getVehicleStatus(vehicle.licenceExpiryDate),
}));

export function getRegisteredVehicleCounts() {
  const dueSoon = REGISTERED_VEHICLES.filter((v) => v.status === 'due-soon' || v.status === 'expired').length;
  return {
    total: REGISTERED_VEHICLES.length,
    dueSoon,
  };
}
