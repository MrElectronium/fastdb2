'use strict'

const fs = require('fs');
const utils = require('./utils.js');
var dbpath = "./dbfiles/";

async function dbCreate(username, password, name) {
    try {
        if (username != undefined && password != undefined && name != undefined) {
            let data = { username: username, password: password };
            let hash = utils.GenerateHash(data)
            let basename = dbpath + hash;
            let user = username + " " + hash + " ";
            let fd = await fs.promises.open(dbpath + "/users.dat", "a+");
            let users = (await fd.readFile()).toString();
            if (!usersearch(users, username)) {
                await fd.write(user);
                await fd.close();
                if (!fs.existsSync(basename)) {
                    await fs.promises.mkdir(basename);
                }
                let dbases = await fs.promises.readdir(basename);

                if (dbases.indexOf(name + ".fdb") == -1) {
                    fd = await fs.promises.open(basename + "/" + name + ".fdb", "a");
                    await fd.close();
                }
                else {
                    console.log("Database exists! please use another database name");
                }
            }
            else {
                await fd.close();
                console.log("This user available! please use another username");
            }
            return { hash: hash, dbname: name }
        }
    }
    catch (error) {
        throw error;
    }
}
function usersearch(users, username) {
    let userstbl = users.split(" ");
    for (let i = 0; i < userstbl.length; i += 2) {
        if (userstbl[i] == username)
            return true;
    }
    return false;
}
async function UserLogin(username, password) {
    try {
        let data = { username: username, password: password };
        let hash = utils.GenerateHash(data);
        let basename = dbpath + hash;
        if (fs.existsSync(basename)) {
            return hash;
        }
    } catch (error) {
        throw error;
    }
}
async function SelectDB(hash, name) {
    try {
        let basename = dbpath + hash;
        let dbases = await fs.promises.readdir(basename);
        if (dbases.indexOf(name + ".fdb") != -1) {
            return (basename + "/" + name + ".fdb");
        }
        else {
            console.log("database mevcut bulunamadı");
        }
    }
    catch (err) {
        throw err;
    }
}
async function ResetPassword(username, newpassword) {
    try {
        let fd = await fs.promises.open(dbpath + "/users.dat", "r+");
        let data = await fd.readFile("utf-8");
        await fd.close();
        data = (data.toString()).split(" ");
        let foundedhash;
        let index;
        for (let i = 0; i < data.length; i += 2) {
            if (data[i] == username) {
                foundedhash = data[i + 1];
                index = i + 1;
                break;
            }
        }

        let userdata = { username: username, password: newpassword };
        let newhash = utils.GenerateHash(userdata);
        let basename = dbpath + foundedhash;
        let newbasename = dbpath + newhash;
        data[index] = newhash;
        data = data.toString().replaceAll(",", " ");
        fs.renameSync(basename, newbasename);
        fd = await fs.promises.open(dbpath + "/users.dat", "r+");
        await fd.writeFile(data);
        await fd.close();

    } catch (error) {
        throw error;
    }
}
async function InsertData(selecteddb, record) {

    try {
        let data = JSON.stringify(record);
        let len = data.length;
        let buffer = Buffer.alloc(len + 44);
        let id = SHA1(data);
        buffer.fill(' ');
        buffer.write(data, 0);
        buffer.writeUInt32LE(len, len);
        buffer.write(id, len + 4);
        let fd = await fs.promises.open(selecteddb, "a");
        await fd.appendFile(buffer);
        await fd.close();
        return record;
    }
    catch (err) {
        throw err;
    }
}

async function getbyid(selecteddb, id) {
    try {
        let fd = await fs.promises.open(selecteddb, "r");
        let data = await fd.readFile();
        fd.close();
        let key, len, content, posstart, posend;
        let p = data.length;
        let founded = -1;
        while (p > 0) {
            key = data.toString('utf-8', p - 40, p);
            len = data.readUInt32LE(p - 44);
            if (id == key) {
                content = data.toString('utf-8', p - 44 - len, p - 44);
                posstart = p - 44 - len;
                posend = p;
                founded = { content, posstart, posend };
                break;
            }
            p -= 44 + len;
        }
        return founded;
    }
    catch (error) {
        throw error;
    }
}

async function SearchQuery(selecteddb, query) {
    try {

        let fd = await fs.promises.open(selecteddb, "r");
        let data = await fd.readFile();
        fd.close();
        let p = data.length;
        let key;
        let len;
        let content;
        let arr = [];
        while (p > 0) {
            key = data.toString('utf-8', p - 40, p);
            len = data.readUInt32LE(p - 44);
            content = JSON.parse(data.toString('utf-8', p - 44 - len, p - 44));
            if (utils.poperation(query, content))
                arr.push({ key, content });
            p -= (44 + len);
        }
        return arr;
    }
    catch (error) {
        throw error;
    }
}
async function UpdateData(selecteddb, id, content) {
    let founded = await getbyid(selecteddb, id);
    if (founded == -1)
        return false;
    let cdata = JSON.stringify(content);
    let len = cdata.length;
    let wbuf = Buffer.alloc(len + 44);
    wbuf.write(cdata, 0);
    wbuf.writeUInt32LE(len, len);
    wbuf.write(id, len + 4);
    try {
        let fd = await fs.promises.open(selecteddb, "r");
        let full = await fd.readFile();
        await fd.close();
        let changed;
        let partend;
        let partfirst;
        partfirst = full.subarray(0, founded.posstart);
        partend = full.subarray(founded.posend, full.length);
        changed = Buffer.concat([partfirst, wbuf, partend]);

        fd = await fs.promises.open(selecteddb, "r+");
        await fd.writeFile(changed);
        await fd.close();
        console.log(changed);
        return { id: id, content: cdata };
    } catch (error) {
        throw error;
    }

}
async function DeleteData(selecteddb, id) {
    let founded = await getbyid(selecteddb, id);
    if (founded == -1)
        return false;
    try {
        let fd = await fs.promises.open(selecteddb, "r");
        let full = await fd.readFile();
        await fd.close();
        let changed;
        let partend;
        let partfirst;
        partfirst = full.subarray(0, founded.posstart);
        partend = full.subarray(founded.posend, full.length);
        changed = Buffer.concat([partfirst, partend]);

        fd = await fs.promises.open(selecteddb, "w");
        await fd.writeFile(changed);
        await fd.close();
        return true;
    } catch (error) {
        throw error;
    }
}
module.exports = {
    UserLogin: UserLogin,
    dbCreate: dbCreate,
    ResetPassword: ResetPassword,
    SelectDB: SelectDB,
    SearchQuery: SearchQuery,
    InsertData: InsertData,
    UpdateData: UpdateData,
    DeleteData: DeleteData,
}







