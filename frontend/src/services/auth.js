import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
})

function cognitoMsg(err) {
  switch (err.code) {
    case 'NotAuthorizedException':    return 'Email hoặc mật khẩu không đúng'
    case 'UserNotFoundException':     return 'Tài khoản không tồn tại'
    case 'UserNotConfirmedException': return 'Tài khoản chưa xác thực. Kiểm tra email để lấy mã.'
    case 'UsernameExistsException':   return 'Email này đã được đăng ký'
    case 'CodeMismatchException':     return 'Mã xác thực không đúng'
    case 'ExpiredCodeException':      return 'Mã đã hết hạn. Vui lòng yêu cầu mã mới.'
    case 'LimitExceededException':    return 'Thử quá nhiều lần. Vui lòng thử lại sau.'
    default:                          return err.message
  }
}

export const authService = {
  getPool: () => userPool,

  getSession() {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser()
      if (!user) return reject(new Error('No current user'))
      user.getSession((err, session) => {
        if (err || !session?.isValid()) return reject(err ?? new Error('Session invalid'))
        resolve(session)
      })
    })
  },

  async getToken() {
    try {
      const session = await authService.getSession()
      return session.getIdToken().getJwtToken()
    } catch {
      return null
    }
  },

  login(email, password) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool })
      const auth = new AuthenticationDetails({ Username: email, Password: password })
      user.authenticateUser(auth, {
        onSuccess(session) {
          const p = session.getIdToken().payload
          resolve({ email: p.email, name: p.name || p.email, sub: p.sub })
        },
        onFailure(err) {
          reject(new Error(cognitoMsg(err)))
        },
        newPasswordRequired() {
          reject(new Error('Cần đặt mật khẩu mới. Liên hệ quản trị viên.'))
        },
      })
    })
  },

  register(name, email, password) {
    return new Promise((resolve, reject) => {
      const attrs = [new CognitoUserAttribute({ Name: 'name', Value: name })]
      userPool.signUp(email, password, attrs, null, (err, result) => {
        if (err) return reject(new Error(cognitoMsg(err)))
        resolve(result)
      })
    })
  },

  confirmRegistration(email, code) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool })
      user.confirmRegistration(code, true, (err, result) => {
        if (err) return reject(new Error(cognitoMsg(err)))
        resolve(result)
      })
    })
  },

  resendConfirmationCode(email) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool })
      user.resendConfirmationCode((err, result) => {
        if (err) return reject(new Error(cognitoMsg(err)))
        resolve(result)
      })
    })
  },

  updateName(name) {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser()
      if (!user) return reject(new Error('Chưa đăng nhập'))
      user.getSession((err) => {
        if (err) return reject(new Error(cognitoMsg(err)))
        user.updateAttributes(
          [new CognitoUserAttribute({ Name: 'name', Value: name })],
          (err2) => {
            if (err2) return reject(new Error(cognitoMsg(err2)))
            resolve()
          }
        )
      })
    })
  },

  changePassword(oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser()
      if (!user) return reject(new Error('Chưa đăng nhập'))
      user.getSession((err) => {
        if (err) return reject(new Error(cognitoMsg(err)))
        user.changePassword(oldPassword, newPassword, (err2) => {
          if (err2) return reject(new Error(cognitoMsg(err2)))
          resolve()
        })
      })
    })
  },

  forgotPassword(email) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool })
      user.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(new Error(cognitoMsg(err))),
      })
    })
  },

  confirmForgotPassword(email, code, newPassword) {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool })
      user.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(new Error(cognitoMsg(err))),
      })
    })
  },

  logout() {
    const user = userPool.getCurrentUser()
    if (user) user.signOut()
  },
}
