const { v4: uuidv4 } = require("uuid");
const { DBConf } = require("./config");

module.exports = {
  makan: async function (req, res) {
    try {
      const request = DBConf.promise();
      let { rfid } = req.body;
      let uuid = uuidv4();
      let tanggal = new Date().toISOString().split("T")[0];

      //ambil data karyawan dari rfid
      let ambilData = await request.query(
        `select m_karyawan_id, nama from m_karyawan where rfid = ?`,
        [rfid]
      );
      if (ambilData[0].length == 0) {
        return res.status(404).json({ message: "RFID tidak di temukan" });
      }

      let data = ambilData[0][0];
      console.log("data karyawan : ", data);

      //cek apakah sebelumnya sudah scan atau belum
      let cekMakan = await request.query(
        `select * from m_makan_karyawan where m_karyawan_id = ? and tanggal =?`,
        [data.m_karyawan_id, tanggal]
      );

      if (cekMakan[0].length > 0) {
        //kalau sudah scan makan, update ismakan = 1

        await request.query(
          `update m_makan_karyawan set ismakan=1 where m_karyawan_id=? and tanggal =?`,
          [data.m_karyawan_id, tanggal]
        );

        //response data tampilkan nama dan ismakan
        return res.json({
          message: `berhasil sudah makan`,
          data: {
            m_karyawan_id: data.m_karyawan_id,
            nama: data.nama,
            tanggal: tanggal,
            ismakan: 1,
          },
        });
      } else {
        //belum scan konfirm makan
        let queryInsert = `
        insert into m_makan_karyawan (m_makan_karyawan_id, m_karyawan_id, tanggal, nama, ismakan) 
        values (?, ?, ?, ?, ?)
        `;
        let insertdata = [uuid, data.m_karyawan_id, tanggal, data.nama, 0];
        await request.query(queryInsert, insertdata);
        return res.json({
          message: `berhasil`,
          data: {
            m_karyawan_id: data.m_karyawan_id,
            nama: data.nama,
            tanggal: tanggal,
            ismakan: 0,
          },
        });
      }
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        data: "Error! Gagal input data makan",
      });
    }
  },
};
