const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/** 
 * @module Admin_Schema 
 */
/**
 * @property {string} email - Email of the user
 * @property {string} password - Password of the user
 * @property {string} phone - Phone of the user
 * @property {string} name - Name of the user
 * @property {string} role - Role of the user
 * @property {string} userImage - User image id
 */

const AdminSchema = new Schema({
	name: {
		type: String
	},
	email: {
		type: String
	},
	password: {
		type: String,
		select: false
	},
	phone: {
		type: String,
	},
	userImage: { type: Schema.Types.ObjectId, 
		ref: 'Image' ,
		default:"303030303030303030303030"
	},
	role: {
		type: String,  /// ACCOUNT_MANAGER, CONTENT_MANAGER, MODULE_MANAGER, ADMIN
	},
	enabled: { 
		type: Boolean ,
		default:true
	},
	isDeleted: { type: Boolean, default: false},
	balance: {type: Number, default: 0},
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	}
});

module.exports = mongoose.model('Admin', AdminSchema);
