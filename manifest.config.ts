import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'JumpNav: The most elegant AI chat navigator you’ve ever seen.',
  description:
    'Floating navigator for ChatGPT,Gemini,Claude. Turn long chats into clickable prompt outlines with reply previews and one-click jump.',
  version: '3.0.0',
  icons: {
    '16': 'logo16.png',
    '48': 'logo48.png',
    '128': 'logo128.png'
  },
  action: {
    default_title: 'JumpNav',
    default_popup: 'popup.html',
    default_icon: {
      '16': 'logo16.png',
      '24': 'logo24.png',
      '32': 'logo32.png'
    }
  },
  permissions: ['storage'],
  content_scripts: [
    {
      matches: [
        'https://chatgpt.com/*',
        'https://chat.openai.com/*',
        'https://gemini.google.com/*',
        'https://claude.ai/*'
      ],
      js: [
        'public/content/vendor/mathjax-config.js',
        'public/content/vendor/mathjax4.js',
        'public/content/vendor/katex.min.js',
        'src/content/index.ts'
      ],
      run_at: 'document_idle'
    }
  ]
});
