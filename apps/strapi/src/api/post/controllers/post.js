'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    
    // Calculate reading time for each post if not set
    data.forEach(post => {
      if (!post.attributes.readingTime && post.attributes.content) {
        post.attributes.readingTime = calculateReadingTime(post.attributes.content);
      }
    });
    
    return { data, meta };
  },

  async findOne(ctx) {
    const { data, meta } = await super.findOne(ctx);
    
    // Calculate reading time if not set
    if (!data.attributes.readingTime && data.attributes.content) {
      data.attributes.readingTime = calculateReadingTime(data.attributes.content);
    }
    
    return { data, meta };
  }
}));

function calculateReadingTime(content) {
  // Remove HTML tags and count words
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  // Average reading speed: 200 words per minute
  return Math.ceil(words / 200);
}