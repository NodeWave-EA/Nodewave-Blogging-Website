/**
 * Bootstrap script to set up default roles and permissions
 * This runs when Strapi starts up
 */

async function ensureAuthorRoleExists(strapi) {
  try {
    // Get the role service
    const roleService = strapi.service('admin::role')

    // Check if Author role already exists
    const existingRoles = await roleService.findMany()
    const authorRole = existingRoles.find(role => role.name === 'Author')

    if (authorRole) {
      console.log('📝 Author role already exists')
      return authorRole
    }

    console.log('📝 Author role not found - it should exist by default')
    console.log(
      '📝 Available roles:',
      existingRoles.map(r => r.name)
    )

    // If Author role doesn't exist, return null and handle in registration
    return null
  } catch (error) {
    console.error('❌ Error checking for Author role:', error)
    throw error
  }
}

async function checkSuperUserExists(strapi) {
  try {
    const userService = strapi.service('admin::user')
    const roleService = strapi.service('admin::role')

    // Get all roles to find the Super Admin role
    const roles = await roleService.findMany()
    const superAdminRole = roles.find(role => role.code === 'strapi-super-admin')

    if (!superAdminRole) {
      console.log('⚠️ Super Admin role not found')
      return false
    }

    // Check if there are any users with Super Admin role
    const superUsers = await userService.findMany({
      roles: [superAdminRole.id],
    })

    const hasSuperUser = superUsers && superUsers.length > 0
    console.log(`👤 Super Admin users found: ${superUsers?.length || 0}`)

    return hasSuperUser
  } catch (error) {
    console.error('❌ Error checking for super users:', error)
    return false
  }
}

module.exports = {
  ensureAuthorRoleExists,
  checkSuperUserExists,
}
