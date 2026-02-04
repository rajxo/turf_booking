/**
 * Role-based authorization middleware factory
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Middleware function
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists (should be attached by auth middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
            });
        }

        next();
    };
};

module.exports = authorize;
