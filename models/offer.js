const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountCodesSchema = new Schema(
{
    ccode: { type: String, require: true},
    isPercent: { type: Boolean, require: true, default: true },
    amount: { type: Number, required: true } ,// if is percent, then number must be ≤ 100, else it’s amount of discount
    expireDate: { type: String, require: true, default: null },
    isActive: { type: Boolean, require: true, default: true }
},{timestamps: { createdAt: 'created_At', updatedAt: 'updated_At', expireAt:'expired_At' }});


DiscountCodesSchema.pre('save', function (next) {
    var currentDate = new Date();
    this.updatedAt = currentDate;
    if (!this.createdAt) {
        this.createdAt = currentDate;
    }
    next();
});
// var Discounts = mongoose.model(DiscountCodes, DiscountCodesSchema);
module.exports = mongoose.model('DiscountCodes',DiscountCodesSchema);


