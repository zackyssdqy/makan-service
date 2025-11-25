const express = require('express')
const { v4: uuidv4 } = require('uuid');
const { DBConf } = require("../config");

module.exports = {
    find: async function (req, res) {
        try {
            const request = await DBConf.promise();
            let qr = await request.query(`select * from m_karyawan`)


            res.status(200).json({ kode: 200, message: 'Sukses ya...' });
        } catch (error) {
            console.log(error);

            res.status(500).json(error);
        }
    }
}