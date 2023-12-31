// Account controller - deliver login view
const utilities = require('../utilities')
const accountModel = require('../models/account-model.js');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
  
 /* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

  /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } 
  
  catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
      )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash(
      "Failure",
      `Could not find,: ${account_email} Please ensure you entered the correct email and password.!`
    )

   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

// Process account management request
async function accountManagement(req, res) {
  let nav = await utilities.getNav();
  res.render("./account/management", {
  title: "Account Management",
  nav,
  errors: null,
  });
  }

async function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  let accountData = res.locals.accountData;
  res.render("./account/updateAccount", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    });
}

async function updateAccountForReal(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const regResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email,
    )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, ${account_firstname}. Account has been updated.`
    )
    // Before rendering this page, create a variable that sets locals.accountData equal
    // to a function from the model that gets account by id (after pass through first, last and email)
    res.status(201).render("./account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, update failed.")
    res.status(501).render("./account/updateAccount", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname, 
      account_lastname, 
      account_email
    })
  }
}

// Update Password
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  let {accountData} = res.locals
  let { account_password } = req.body
  let hashedPassword
  try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
      req.flash("notice", 'Sorry, there was an error changing account info.')
      res.status(500).render("account/updateAccount", {
          title: "Update Account",
          nav,
          errors: null,
      })
  }
  const updateResult = await accountModel.updatePassword(
      hashedPassword, accountData.account_id
  )
  if (updateResult) {
      res.locals.accountData = await accountModel.getAccount(accountData.account_id)
      let accountData1 = res.locals.accountData
      req.flash("notice", "Password has been updated.")
      res.status(201).render("./account/", {
        title: "Account Management",
          nav,
          errors: null,
          accountData1
      })
  } else {
      req.flash("notice", "Update failed. Please try again.")
      res.status(501).render("./account/updateAccount", {
          title: "Update Account",
          nav,
          errors: null,
      })
  }
}

async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You're logged out.")
  res.redirect("/")
}

  module.exports = { buildLogin, buildRegister,registerAccount, accountManagement, accountLogin, logout, updateAccount, updateAccountForReal, updatePassword, accountLogout};