"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Firebase_1 = require("./Firebase");
const firebase = new Firebase_1.Firebase();
class DbFirestore {
    db() {
        let db1 = firebase.get().firestore();
        db1.settings({
            timestampsInSnapshots: true
        });
    }
}
exports.DbFirestore = DbFirestore;
module.exports = {
    DbFirestore
};