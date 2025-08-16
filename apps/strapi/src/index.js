'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🔧 Setting up Strapi permissions...');
    
    try {
      // Get the public role
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({
          where: {
            type: 'public'
          }
        });

      if (!publicRole) {
        console.log('❌ Public role not found');
        return;
      }

      console.log('✅ Found public role:', publicRole.id);

      // Get current permissions
      const permissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({
          where: {
            role: publicRole.id,
            action: ['api::post.post.find', 'api::post.post.findOne']
          }
        });

      console.log('📋 Current post permissions:', permissions.length);

      // Enable find and findOne permissions for posts
      const actionsToEnable = ['api::post.post.find', 'api::post.post.findOne'];
      
      for (const action of actionsToEnable) {
        const existingPermission = permissions.find(p => p.action === action);
        
        if (existingPermission && !existingPermission.enabled) {
          // Update existing permission
          await strapi
            .query('plugin::users-permissions.permission')
            .update({
              where: { id: existingPermission.id },
              data: { enabled: true }
            });
          console.log(`✅ Enabled permission: ${action}`);
        } else if (!existingPermission) {
          // Create new permission
          await strapi
            .query('plugin::users-permissions.permission')
            .create({
              data: {
                action,
                subject: null,
                properties: {},
                conditions: [],
                role: publicRole.id,
                enabled: true
              }
            });
          console.log(`✅ Created permission: ${action}`);
        } else {
          console.log(`ℹ️  Permission already enabled: ${action}`);
        }
      }

      console.log('🎉 Strapi permissions setup complete!');
      console.log('📝 Posts are now publicly accessible at: /api/posts');
      
    } catch (error) {
      console.error('❌ Error setting up permissions:', error);
    }
  },
};