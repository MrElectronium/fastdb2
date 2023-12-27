const { createHash } = require('node:crypto');
var salt = "CDDA3BF2A2D1D712CC5E394E8624F";
//Salt value

function SHA256Salty(dataobj) {
    let data = JSON.stringify(dataobj);
    if (data.length <= 0)
        return -1;
    let salty = "";
    let maxlen = data.length > salt.length ? data.length : salt.length;
    for (let i = 0; i < maxlen; i++) {
        if (i < data.length)
            salty += data[i];
        if (i < salt.length)
            salty += salt[i];
    }

    const result = createHash('SHA256').update(salty).digest('hex');
    return result;
}
//To define unique ID for records
function SHA1(data) {
    return createHash('SHA-1').update(data).digest(16).toString('hex');
}

function GenerateHash(data) {
    return SHA1(SHA256Salty(data));
}

const logical = ["AND", "OR", "NAND", "NOR"];
const operators = ["<like>", "<nlike>", ">=", "<=", "!=", "<", ">", "="];

function logicalopr(a, b, opr) {
    let result = false;
    let value1 = a;
    let value2 = b;

    switch (opr.toUpperCase()) {
        case "AND":
            if (value1 && value2)
                result = true;
            break;
        case "OR":
            if (value1 || value2)
                result = true;
            break;
        case "NAND":
            if (!(value1 && value2))
                result = true;
            break;
        case "NOR":
            if (!(value1 || value2))
                result = true;
            break;
        default:
            break;
    }

    return result;
}
function operatorprocess(operator, value1, value2) {
    let result = false;

    switch (operator) {
        case "<":
            result = parseFloat(value1) < parseFloat(value2);
            break;
        case ">":
            result = parseFloat(value1) > parseFloat(value2);
            break;
        case "<=":
            result = parseFloat(value1) <= parseFloat(value2);
            break;
        case ">=":
            result = parseFloat(value1) >= parseFloat(value2);
            break;
        case "!=":
            result = value1 != value2;
            break;
        case "=":
            result = value1 == value2;
            break;
        case "<like>":
            result = value1.includes(value2);
            break;
        case "<nlike>":
            result = !value1.includes(value2);
            break;

    }

    return result;
}
function compareParam(query, obj) {

    let result = false;
    let maxMatch = 0;
    if (query == "T")
        return true;
    else if (query == "F")
        return false;
    for (const operator of operators) {
        const index = query.indexOf(operator);
        if (index !== -1) {
            if (operator.length > maxMatch) {
                maxMatch = operator.length;
                let param = query.slice(0, index);
                let value = query.slice(index + operator.length, query.length);
                result = operatorprocess(operator, obj[param], value)
            }
        }
    }

    return result;
}
function detectlogical(query) {

    for (let i = 0; i < query.length; i++) {
        for (let o of logical) {
            if (query[i].toUpperCase() == o)
                return true;
        }
    }
    return false;
}
function detectopr(value) {
    for (let i = 0; i < value.length; i++) {
        for (let o of operators) {
            if (value[i].includes(o))
                return true;
        }
    }
    return false;
}

function getopr(query) {
    let index1 = -1, index2 = -1;

    for (let i = 0; i < query.length; ++i) {
        if (query[i] == "(") {
            if (i > index1)
                index1 = i;
        }
    }
    for (let i = index1; i < query.length; ++i) {
        if (query[i] == ")") {
            index2 = i;
            break;
        }
    }

    return {
        query: query.slice(index1 + 1, index2),
        index1: index1,
        index2: index2
    }
}
function poperation(query, item) {


    let lastquery = query;

    while (lastquery.includes('(')) {
        let inner = getopr(lastquery);
        let result = evalopr(inner.query, item);

        result == true ? result = "T" : result = "F";
        lastquery = lastquery.slice(0, inner.index1) + result + (lastquery.slice(inner.index2 + 1, query.length));
    }
    if (detectlogical(lastquery.split(" "))) {
        lastquery = evalopr(lastquery, item);
    }
    if (detectopr(lastquery)) {
        lastquery = compareParam(lastquery, item);
    }
    if (lastquery == "F")
        lastquery = false;
    if (lastquery == "T")
        lastquery = true;
    return lastquery;
}
function evalopr(query, obj) {
    let squery = query.split(" ");
    let operations = [];
    let result = false;
    let founded = false;
    let opr;
    for (let i = 0; i < squery.length; i++) {
        for (let o of logical) {
            if (squery[i].toUpperCase() == o) {
                opr = o;
                founded = true;
                if (i == 1) {
                    operations.push({ a: squery[i - 1], b: squery[i + 1], opr: opr });
                    result = logicalopr(compareParam(squery[i - 1], obj), compareParam(squery[i + 1], obj), opr);
                }
                else {
                    operations.push({ a: "ANS", b: squery[i + 1], opr: opr });
                    result = logicalopr(result, compareParam(squery[i + 1], obj), opr);
                }

            }
        }
    }

    if (!founded) {
        result = compareParam(query, obj);
    }
    return result;
}
module.exports =
{
    poperation: poperation,
    evalopr: evalopr,
    GenerateHash, GenerateHash
}