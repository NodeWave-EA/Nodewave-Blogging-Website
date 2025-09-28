/**
 * Admin status controller
 * Handles checking super admin existence
 */

module.exports = {
  async checkSuperAdminStatus(ctx) {
    try {
      const userService = strapi.service('admin::user')
      const roleService = strapi.service('admin::role')

      // Get all roles to find the Super Admin role
      const roles = await roleService.findMany()
      const superAdminRole = roles.find(role => role.code === 'strapi-super-admin')

      if (!superAdminRole) {
        return ctx.send({
          hasSuperAdmin: false,
          message: 'Super Admin role not found',
        })
      }

      // Check if there are any users with Super Admin role
      const superUsers = await userService.findMany({
        roles: [superAdminRole.id],
      })

      const hasSuperAdmin = superUsers && superUsers.length > 0

      ctx.send({
        hasSuperAdmin,
        adminCount: superUsers?.length || 0,
        message: hasSuperAdmin ? 'Super Admin exists' : 'No Super Admin found',
      })
    } catch (error) {
      console.error('❌ Error checking super admin status:', error)
      ctx.send(
        {
          hasSuperAdmin: true, // Default to true for security
          error: 'Unable to check super admin status',
          message: 'Error occurred while checking admin status',
        },
        500
      )
    }
  },
}
