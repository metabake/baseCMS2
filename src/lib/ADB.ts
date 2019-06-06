
import sqlite = require('sqlite')
const bcrypt = require('bcryptjs') // to hash pswdws

// include in API for WebAdmin

// guid for pk client side 
// eg: bcrypt randomBytes(16).toString("hex") or base64, or Math.random to make base64 char 16 times
// also to email a random # 

export class ADB { // auth & auth DB
   // emailjs is client side api
   db

   async createNewADBwSchema(dbPath) { // the admin db is set to 'P@ssw0rd!' and you have to change it first time on DB create
      const dbPro = sqlite.open(dbPath)
      this.db = await dbPro
      this.db.configure('busyTimeout', 2 * 1000)
   }

   isUserAuth(userEmail, pswdHash) { // yes the pswds are a hash
      // run some code and:
      return 'editor'
   }
   async addAdmin(email, password, emailjsService_id, emailjsTemplate_id, emailjsUser_id, pathToSite) {
      let randomID = '_' + Math.random().toString(36).substr(2, 9)
      var salt = bcrypt.genSaltSync(10);
      var hashPass = bcrypt.hashSync(password, salt);

      await this.db.run(`CREATE TABLE  admin(id, email, password, emailjsService_id, emailjsTemplate_id, emailjsUser_id, pathToSite, vcode)`);
      await this.db.run(`CREATE TABLE editors(id, email, password, name, emailjsService_id, emailjsTemplate_id, emailjsUser_id)`);
      await this.db.run(`INSERT INTO admin(id, email, password, emailjsService_id, emailjsTemplate_id, emailjsUser_id, pathToSite) VALUES('${randomID}','${email}', '${hashPass}', '${emailjsService_id}', '${emailjsTemplate_id}', '${emailjsUser_id}', '${pathToSite}')`, function (err) {
         if (err) {
         }
         // get the last insert id
      });
   }

   validateEmail(email, password) {
      let _this = this
      return new Promise(function (resolve, reject) {
         _this.db.get(`SELECT password FROM admin WHERE email=?`, email, function (err, row) {
            if (err) {
            }
            return row
         }).then(function (row) {
            bcrypt.compare(password, row.password, function (err, res) {
               resolve(res)
            })
         })
      })
   }

   validateEditorEmail(email, password) {
      let _this = this
      return new Promise(function (resolve, reject) {
         _this.db.get(`SELECT password FROM editors WHERE email=?`, email, function (err, row) {
            if (err) {
            }
            return row
         }).then(function (row) {
            if (typeof row != 'undefined') {
               return bcrypt.compare(password, row.password)
                  .then((res) => {
                     _this.db.get(`SELECT pathToSite FROM admin`, [], function (err, row) {
                        console.info("--row:", row)
                        if (err) {
                        }
                        return row
                     }).then(function (row) {
                        let temp = {}
                        console.info("--res:", res)
                        temp['pass'] = res
                        temp['pathToSite'] = row.pathToSite
                        console.info("--result:", temp)
                        resolve(temp)
                     })
                  });
            }
         })
      })
   }
   getEditors() {
      return this.db.all(`SELECT id, name, email FROM editors`, [], function (err, rows) {
         if (err) {
         }
         return rows
      })
   }
   addEditor(email, name, password) {
      let randomID = '_' + Math.random().toString(36).substr(2, 9)
      var salt = bcrypt.genSaltSync(10);
      var hashPass = bcrypt.hashSync(password, salt);
      return this.db.run(`INSERT INTO editors(id,email, password, name) VALUES('${randomID}','${email}', '${hashPass}', '${name}')`, function (err) {
         if (err) {
         }
         // get the last insert id
         return this.lastID
      });
   }
   editEditor(name, id) {
      return this.db.run(`UPDATE editors SET name='${name}' WHERE id='${id}'`, function (err) {
         if (err) {
         }
         // get the last insert id
         return this.lastID
      });
   }
   deleteEditor(id) {
      return this.db.run(`DELETE FROM editors WHERE id='${id}'`, function (err) {
         if (err) {
         }
         // get the last insert id
      });
   }

   async sendVcode(email) {
      let vcode = Math.floor(1000 + Math.random() * 9000);
      await this.db.run(`UPDATE admin SET vcode='${vcode}' WHERE email='${email}'`, function (err, rows) {
         if (err) {
         }
         return rows
      });

      return vcode;
   }

   resetPassword(email, vcode, password) {
      var salt = bcrypt.genSaltSync(10);
      let hashPass = bcrypt.hashSync(password, salt);

      return this.db.run(`UPDATE admin SET password='${hashPass}' WHERE email='${email}' AND vcode='${vcode}'`)
         .then(res => {
            if (res.changes > 0) {
               return true;
            } else {
               return false;
            }
         })
         .catch(err => {
            return false;
         })
   }

   getEmailJsSettings() {
      return this.db.all(`SELECT email, emailjsService_id, emailjsTemplate_id, emailjsUser_id FROM admin`, [], function (err, rows) {
         if (err) {
         }
         return rows
      })
   }

}

// module.exports = {
//    ADB
// }