var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

/** 
 * @module Faqs_Schema 
 */

var Faqs_Schema = new Schema({
    
    question: {
        type: String,
    },
    answer: {
        type: String,
    },
   status: {
       type: Boolean, default: false
   },
   deleted: {
    type: Boolean, default: false
}
}, 
{
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model('Faqs', Faqs_Schema);
