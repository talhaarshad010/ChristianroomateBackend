const Admin = require('../models/admin')
const Information = require('../models/information');
const Images = require('../models/images')
const media = require('./media-center')
var path = require('path');
var url = require('url');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let globalValues = {

}

async function AdminInitialEntry() {
  let adminentry = await Admin.findOne({
    email: 'admin@gmail.com'
  })
  if (!adminentry) {
    const salt = bcrypt.genSaltSync(10);
    let hash = await bcrypt.hash('admin@123', salt)
    var newEntry = new Admin();
    newEntry.email = "admin@gmail.com";
    newEntry.email.toLowerCase();
    newEntry.password = hash
    newEntry.name = "RoommateAdmin";
    newEntry.phone = 9090909091;
    newEntry.role="ADMIN",
    newEntry.enabled=true
    // newEntry.userImage = 'demo.png';
    await newEntry.save()
  }
  else { }

}
AdminInitialEntry()
async function AdminBalanceEntry(){
  let adminentry = await Information({
    key: 'admin_balance'
    })
      if (!adminentry) {
      var newUser = new Admin();
      newUser.key ='admin_balance';
      newUser.numberValue = 0;
      await newUser.save()
      }
  }

  AdminBalanceEntry()




async function termsCondition() {
  let adminentry = await Information.findOne({
    key: 'terms_condition'
  })
  if (!adminentry) {
    var newInformation = new Information();
    newInformation.key = 'terms_condition';
    newInformation.section = 'Terms and Conditions';
    await newInformation.save()
  }
}


async function termsPrivacy() {
  let adminentry = await Information.findOne({
    key: 'privacy_policy'
  })
  if (!adminentry) {
    var newInformation = new Information();
    newInformation.key = 'privacy_policy';
    newInformation.section = 'Terms and Conditions';
    await newInformation.save()
  }
}

termsPrivacy()
async function cancelation() {
  let adminentry = await Information.findOne({
    key: 'cancelation_policy'
  })
  if (!adminentry) {
    var newInformation = new Information();
    newInformation.key = 'cancelation_policy';
    newInformation.section = 'Terms and Conditions';
    await newInformation.save()
  }
}

cancelation()

async function about(){
  let adminentry = await Information.findOne({
    key: 'about'
    })
      if (!adminentry) {
      var newInformation = new Information();
      newInformation.key ='about';
      newInformation.section ='Terms and Conditions' ;
      await newInformation.save()
      }
  }

  about()

async function ImageInitialEntry() {
  let imageentry = await Images.findOne({
    _id: '303030303030303030303030'
  })
  // console.log(imageentry, "test");
  if (!imageentry) {

    let uploadData = path.join(__dirname, '../public/img/default.jpeg')
    fs.readFile(uploadData, async (err, data)=>{
      // error handle
      if(err) {
          throw err;
      }

      // convert image file to base64-encoded string
      const base64Image = await Buffer.from(data, 'binary').toString('base64');

      let  doc=await media.imageUpload(base64Image)
      console.log(doc)

    })
  }

  }

async function ImageInitialEntry2() {
  let imageentry = await Images.findOne({
    _id: '313131313131313131313131'
  })
  // console.log(imageentry, "test");
  if (!imageentry) {

    let uploadData = path.join(__dirname, '../public/img/property.jpeg')
    fs.readFile(uploadData, async (err, data)=>{
      // error handle
      if(err) {
        throw err;
      }

      // convert image file to base64-encoded string
      const base64Image = await Buffer.from(data, 'binary').toString('base64');

      let  doc=await media.imageUpload2(base64Image)
      console.log(doc)

    })
  }

}

ImageInitialEntry()
ImageInitialEntry2()

module.exports = {
  globalValues,

};

