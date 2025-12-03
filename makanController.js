// const { v4: uuidv4 } = require("uuid");
const { DBConf } = require("./config");


const { v4: uuidv4 } = require("uuid");
// const { DBEmployee } = require("../../config");
// const respone = require("../../utils/respone");

module.exports = {
  makan: async function (req, res) {
    try {
      const request = DBConf.promise();
      let { rfid } = req.body;
      let uuid = uuidv4();
      let tanggal = new Date().toISOString().split("T")[0];
      // let tanggal = "2025-11-27";

      console.log("rfid", rfid, "tanggallll", tanggal);

      const shift1_in = { mulai: "06:00:00", selesai: "10:00:00" };
      const shift1_out = { mulai: "11:30:00", selesai: "14:30:00" };

      const shift2_in = { mulai: "14:00:00", selesai: "15:00:00" };
      const shift2_out = { mulai: "17:30:00", selesai: "19:00:00" };

      let now = new Date();
      let jamScan = now.toTimeString().split(" ")[0];
      // let jamScan = "12:20:00";

      let ismakan = null;
      let actMkn = null;

      function isWaktuMakan(jam, shift) {
        return jam >= shift.mulai && jam <= shift.selesai;
      }

      //ambil data karyawan dari rfid
      let ambilData = await request.query(
        `select m_karyawan_id, nama from m_karyawan where rfid = ?`,
        [rfid]
      );
      if (ambilData[0].length == 0) {
        return res.json({ message: "RFID tidak ditemukan" });
      }

      let data = ambilData[0][0];
      console.log("data karyawan : ", data);

      //cek apakah sebelumnya sudah scan atau belum
      let cekMakan = await request.query(
        `select * from m_makan_karyawan where m_karyawan_id = ? and tanggal =?`,
        [data.m_karyawan_id, tanggal]
      );

      // if (data.ismakan === 1 && data.actual_makan === 1) {
      //   return res.json({
      //     message: ``,
      //     data: {
      //       nama: data.nama,
      //       ismakan: data.ismakan,
      //       actual_makan: data.actual_makan,
      //       jamScan: jamScan,
      //     },
      //   });
      // }

      if (cekMakan[0].length > 0) {
        //kalau sudah scan makan, update ismakan = 1

        if (
          isWaktuMakan(jamScan, shift1_in) ||
          isWaktuMakan(jamScan, shift2_in)
        ) {
          ismakan = 1;
          await request.query(
            `update m_makan_karyawan set ismakan=? where m_karyawan_id=? and tanggal =?`,
            [ismakan, data.m_karyawan_id, tanggal]
          );
        } else if (
          isWaktuMakan(jamScan, shift1_out) ||
          isWaktuMakan(jamScan, shift2_out)
        ) {
          actMkn = 1;
          await request.query(
            `update m_makan_karyawan set actual_makan=? where m_karyawan_id=? and tanggal =?`,
            [actMkn, data.m_karyawan_id, tanggal]
          );
        } else {
          return res.json({
            message: `Scan diluar jam`,
            data: {
              nama: data.nama,
              jamScan: jamScan,
            },
          });
        }

        //response data tampilkan nama dan ismakan
        return res.json({
          message: `berhasil`,
          data: {
            m_karyawan_id: data.m_karyawan_id,
            nama: data.nama,
            tanggal: tanggal,
            ismakan: ismakan,
            actual_makan: actMkn,
            jamScan: jamScan,
          },
        });
      } else {
        //belum scan konfirm makan

        if (
          isWaktuMakan(jamScan, shift1_in) ||
          isWaktuMakan(jamScan, shift2_in)
        ) {
          ismakan = 1;
        } else if (
          isWaktuMakan(jamScan, shift1_out) ||
          isWaktuMakan(jamScan, shift2_out)
        ) {
          actMkn = 1;
        } else {
          return res.json({
            message: `Scan diluar jam`,
            data: {
              nama: data.nama,
              jamScan: jamScan,
            },
          });
        }

        let queryInsert = `
        insert into m_makan_karyawan (m_makan_karyawan_id, m_karyawan_id, tanggal, nama, ismakan, actual_makan) 
        values (?, ?, ?, ?, ?, ?)
        `;
        let insertdata = [
          uuid,
          data.m_karyawan_id,
          tanggal,
          data.nama,
          ismakan,
          actMkn,
        ];
        await request.query(queryInsert, insertdata);

        return res.json({
          message: `berhasil`,
          data: {
            m_karyawan_id: data.m_karyawan_id,
            nama: data.nama,
            tanggal: tanggal,
            ismakan: ismakan,
            actual_makan: actMkn,
            jamScan: jamScan,
          },
        });
      }
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        message: "Error! Gagal input data makan",
        data: error,
      });
    }
  },

  findMakan: async function (req, res) {
    try {
      const request = DBEmployee.promise();

      let { tanggal } = req.body;
      let mkn;

      if (!tanggal || tanggal === "") {
        let [rows] = await request.query(`select * from m_makan_karyawan`);
        mkn = rows;
      } else {
        let [rows] = await request.query(
          `select * from m_makan_karyawan WHERE tanggal = ?`,
          [tanggal]
        );
        mkn = rows;
      }

      return res.send(respone("200", mkn));
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        message: error,
      });
    }
  },
};

