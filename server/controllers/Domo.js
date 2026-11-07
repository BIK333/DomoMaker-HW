const models = require('../models');
const Domo = models.Domo;
const makerPage = async (req, res) => {
    if (!req.session || !req.session.account) {
      return res.redirect('/');
    }
  
    try {
      const query = {
        owner: req.session.account._id,
      };
  
      const docs = await Domo.find(query)
        .select('name age')
        .lean()
        .exec();
  
      return res.render('app', {
        domos: docs,
      });
    } catch (err) {
      console.log(err);
  
      return res.status(500).json({
        error: 'Error retrieving domos!',
      });
    }
};

const makeDomo = async (req, res) => {
    if (!req.session || !req.session.account) {
      return res.status(401).json({
        error: 'You must be logged in to create a Domo.',
      });
    }
  
    if (!req.body.name || req.body.age === undefined
        || String(req.body.age).trim() === '') {
      return res.status(400).json({
        error: 'Both name and age are required!',
      });
    }
  
    const age = Number(req.body.age);
  
    if (!Number.isInteger(age) || age < 0) {
      return res.status(400).json({
        error: 'Age must be a non-negative integer!',
      });
    }
  
    const domoData = {
      name: req.body.name,
      age,
      owner: req.session.account._id,
    };
  
    try {
      const newDomo = new Domo(domoData);
      await newDomo.save();
  
      return res.json({
        redirect: '/maker',
      });
    } catch (err) {
      console.log(err);
  
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Invalid Domo data!',
        });
      }
  
      return res.status(500).json({
        error: 'An error occurred making Domo!',
      });
    }
};

module.exports = {
    makerPage,
    makeDomo,
};