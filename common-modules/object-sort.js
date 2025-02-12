function sortObj(doc, order) {
  const newDoc = [];
  let serialNumber = 1;

  for (let obj of doc) {
    obj["SNo"] = serialNumber++;
    obj["Transaction Amount"] = `$${obj["Transaction Amount"]}`
    obj["Rent"] = `$${obj["Rent"]}`
    obj["Budget"] = `$${obj["Budget"]}`
    const sortedObj = JSON.parse(JSON.stringify(obj, order));
    newDoc.push(sortedObj);
  }

  return newDoc;
}

module.exports = sortObj;
