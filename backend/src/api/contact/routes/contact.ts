export default {
  routes: [
    {
      method: 'POST',
      path: '/contact',
      handler: 'contact.submit',
      config: {
        auth: false, // Allow public access but frontend will still send API token
        policies: [],
      },
    },
  ],
}
