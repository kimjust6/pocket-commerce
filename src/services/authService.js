import { pb } from './pbClient'

export async function loginWithPassword(emailOrUsername, password) {
  return await pb.collection('users').authWithPassword(emailOrUsername, password)
}

export async function loginWithOAuth2(provider = 'google') {
  return await pb.collection('users').authWithOAuth2({ provider })
}

export async function registerUser({ email, password, passwordConfirm, name, username }) {
  const cleanUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000)
  return await pb.collection('users').create({
    email,
    password,
    passwordConfirm,
    name: name || cleanUsername,
    username: cleanUsername,
  })
}

export async function updateUserRecord(userId, data) {
  return await pb.collection('users').update(userId, data)
}
