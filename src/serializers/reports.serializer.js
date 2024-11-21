const { toCamelCase, removeCircularReferences } = require('../helpers/serializer.helper');

const reportsSerializer = (req, res, next) => {
  if (!res.data) return next();

  const normalizeMetadata = metadata => {
    if (!metadata) return metadata;
    return Array.isArray(metadata)
      ? metadata.map(item => toCamelCase(item))
      : {
          totalShipments: metadata.totalShipments || 0,
          successfulDeliveries: metadata.successfulDeliveries || 0,
          inTransit: metadata.inTransit || 0,
          pendingShipments: metadata.pendingShipments || 0,
          totalValue: metadata.totalValue || 0,
          filtersApplied: {
            startDate: metadata.filtersApplied?.startDate || null,
            endDate: metadata.filtersApplied?.endDate || null,
          },
          reportGeneratedForRoles: metadata.reportGeneratedForRoles || [],
        };
  };

  const serializeReport = report => ({
    url: report.url,
    metadata: normalizeMetadata(report.metadata),
  });

  const serializeData = data => {
    if (Array.isArray(data)) {
      return data.map(serializeReport);
    } else if (data) {
      return serializeReport(data);
    }
    return data; // Fallback for null or undefined data
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data); // Convert keys to camelCase
  next();
};

module.exports = reportsSerializer;
