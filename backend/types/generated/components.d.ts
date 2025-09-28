import type { Schema, Struct } from '@strapi/strapi'

export interface SharedNewsletterPreferences extends Struct.ComponentSchema {
  collectionName: 'components_shared_newsletter_preferences'
  info: {
    description: 'User preferences for newsletter subscriptions'
    displayName: 'Newsletter Preferences'
  }
  attributes: {
    digest_format: Schema.Attribute.Enumeration<['html', 'text', 'markdown']> &
      Schema.Attribute.DefaultTo<'html'>
    frequency: Schema.Attribute.Enumeration<['daily', 'weekly', 'monthly', 'never']> &
      Schema.Attribute.DefaultTo<'weekly'>
    include_featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    include_new_posts: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    include_trending: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>
    language: Schema.Attribute.String & Schema.Attribute.DefaultTo<'en'>
  }
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos'
  info: {
    description: 'SEO metadata component'
    displayName: 'SEO'
  }
  attributes: {
    canonical_url: Schema.Attribute.String
    meta_description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160
      }>
    meta_keywords: Schema.Attribute.String
    meta_title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    og_description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160
      }>
    og_image: Schema.Attribute.Media<'images'>
    og_title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
    og_type: Schema.Attribute.Enumeration<['website', 'article', 'profile']> &
      Schema.Attribute.DefaultTo<'article'>
    robots: Schema.Attribute.Enumeration<
      ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow']
    > &
      Schema.Attribute.DefaultTo<'index,follow'>
    twitter_card: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image', 'app', 'player']
    > &
      Schema.Attribute.DefaultTo<'summary_large_image'>
    twitter_description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160
      }>
    twitter_image: Schema.Attribute.Media<'images'>
    twitter_title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }>
  }
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links'
  info: {
    description: 'Social media links component'
    displayName: 'Social Link'
  }
  attributes: {
    color: Schema.Attribute.String
    icon: Schema.Attribute.String
    platform: Schema.Attribute.Enumeration<
      [
        'twitter',
        'facebook',
        'instagram',
        'linkedin',
        'github',
        'youtube',
        'tiktok',
        'pinterest',
        'discord',
        'telegram',
        'whatsapp',
        'website',
        'other',
      ]
    > &
      Schema.Attribute.Required
    url: Schema.Attribute.String & Schema.Attribute.Required
    username: Schema.Attribute.String
  }
}

export interface SharedSocialSharing extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_sharings'
  info: {
    description: 'Social sharing configuration for posts'
    displayName: 'Social Sharing'
  }
  attributes: {
    custom_message: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 280
      }>
    enable_sharing: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>
    hashtags: Schema.Attribute.String
    platforms: Schema.Attribute.JSON &
      Schema.Attribute.DefaultTo<
        ['twitter', 'facebook', 'linkedin', 'pinterest', 'whatsapp', 'telegram', 'reddit']
      >
    via_username: Schema.Attribute.String
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.newsletter-preferences': SharedNewsletterPreferences
      'shared.seo': SharedSeo
      'shared.social-link': SharedSocialLink
      'shared.social-sharing': SharedSocialSharing
    }
  }
}
