export async function onRequestGet({ params }) {
  const filename = encodeURIComponent(params.vkey)
  return fetch('https://i.imgur.com/' + filename)
}
