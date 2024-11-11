function allowedRoles(requiredRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.Roles) {
      return res.status(401).json({ message: 'Access denied. User not authenticated.' });
    }

    const userRoles = req.user.roles;

    // Check if the user's roles include at least one of the required roles
    const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
}

module.exports = allowedRoles;
