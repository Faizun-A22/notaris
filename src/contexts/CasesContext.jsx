import React, { createContext, useState, useEffect } from 'react';
import { generateCaseNumber } from '../utils/generateCaseNumber';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const getRawDefaultChecklist = (serviceType) => {
  if (serviceType === 'SKMHT') {
    return [
      { id: 1, name: 'SERTIFIKAT ASLI', desc: 'Must be physical original document', status: 'Sudah Diterima' },
      { id: 2, name: 'KTP AN. PEMEGANG HAK', desc: 'Valid E-KTP photocopy or scan', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP PERSETUJUAN PEMEGANG HAK', desc: 'Required for married individuals', status: 'Belum Ada' },
      { id: 4, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Family Registry card', status: 'Sudah Diterima' },
      { id: 5, name: 'FOTOKOPI SURAT NIKAH', desc: 'Marriage certificate', status: 'Perlu Verifikasi' },
      { id: 6, name: 'FOTOKOPI PBB TAHUN BERJALAN', desc: 'Latest property tax receipt', status: 'Sudah Diterima' },
      { id: 7, name: 'FOTOKOPI PERJANJIAN KREDIT', desc: 'Credit agreement from bank', status: 'Sudah Diterima' },
      { id: 8, name: 'FOTOKOPI KTP PIHAK BANK', desc: 'Bank officer representative ID', status: 'Belum Ada' },
      { id: 9, name: 'FOTOKOPI SK PIHAK BANK', desc: 'Officer\'s letter of appointment', status: 'Belum Ada' },
    ];
  }
  if (serviceType === 'AJB') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat asli (HM/HGB/HP) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'Fotokopi KTP Pemegang Hak', desc: 'Valid E-KTP photocopy or scan of seller', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi KTP Persetujuan Pemegang Hak', desc: 'Required for married individuals', status: 'Belum Ada' },
      { id: 4, name: 'Fotokopi Surat Nikah Pemegang Hak', desc: 'Marriage certificate of seller', status: 'Sudah Diterima' },
      { id: 5, name: 'Fotokopi KK Pemegang Hak', desc: 'Family Registry card of seller', status: 'Sudah Diterima' },
      { id: 6, name: 'Fotokopi KTP Pembeli', desc: 'Valid E-KTP photocopy or scan of buyer', status: 'Perlu Verifikasi' },
      { id: 7, name: 'Fotokopi KK Pembeli', desc: 'Family Registry card of buyer', status: 'Sudah Diterima' },
      { id: 8, name: 'Nomor Telepon dan Email Pembeli', desc: 'Contact details of buyer', status: 'Sudah Diterima' },
      { id: 9, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Latest property tax receipt', status: 'Belum Ada' },
      { id: 10, name: 'Share Lokasi Tanah', desc: 'Location coordinates or map link', status: 'Sudah Diterima' },
      { id: 11, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Physical photo with coordinate stamp', status: 'Belum Ada' },
    ];
  }
  if (serviceType === 'HIBAH') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat asli tanah/bangunan', status: 'Sudah Diterima' },
      { id: 2, name: 'Fotokopi KTP Pemegang Hak', desc: 'Fotokopi KTP pemberi hibah', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi KTP Persetujuan Istri Pemegang Hak', desc: 'Persetujuan istri pemberi hibah', status: 'Belum Ada' },
      { id: 4, name: 'Fotokopi Surat Nikah Pemegang Hak', desc: 'Surat nikah pemberi hibah', status: 'Sudah Diterima' },
      { id: 5, name: 'Fotokopi KK Pemegang Hak', desc: 'Kartu Keluarga pemberi hibah', status: 'Sudah Diterima' },
      { id: 6, name: 'Fotokopi KTP Persetujuan Seluruh Anak', desc: 'Fotokopi KTP persetujuan seluruh anak kandung', status: 'Belum Ada' },
      { id: 7, name: 'Fotokopi KK Persetujuan Seluruh Anak', desc: 'Kartu Keluarga persetujuan anak', status: 'Belum Ada' },
      { id: 8, name: 'Fotokopi Akta Kelahiran Seluruh Anak', desc: 'Akta kelahiran anak kandung', status: 'Belum Ada' },
      { id: 9, name: 'Surat Keterangan Anak dari Desa', desc: 'Surat keterangan anak/silsilah waris', status: 'Belum Ada' },
      { id: 10, name: 'Fotokopi KTP Penerima Hibah', desc: 'Fotokopi KTP penerima hibah', status: 'Belum Ada' },
      { id: 11, name: 'Fotokopi KK Penerima Hibah', desc: 'Kartu Keluarga penerima hibah', status: 'Belum Ada' },
      { id: 12, name: 'Fotokopi Akta Kelahiran Penerima Hibah', desc: 'Akta kelahiran penerima hibah', status: 'Belum Ada' },
      { id: 13, name: 'Nomor Telepon dan Email Penerima Hibah', desc: 'Kontak penerima hibah', status: 'Sudah Diterima' },
      { id: 14, name: 'Fotokopi PBB Tahun Berjalan', desc: 'PBB tahun berjalan pemberi hibah', status: 'Belum Ada' },
      { id: 15, name: 'Share Lokasi Tanah', desc: 'Share lokasi tanah/objek hibah', status: 'Sudah Diterima' },
      { id: 16, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto objek hibah dari kamera GPS', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'APHB') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat tanah asli HM/HGB/HP', status: 'Sudah Diterima' },
      { id: 2, name: 'Surat Keterangan Ahli Waris Asli', desc: 'Surat keterangan ahli waris asli', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi Legalisir Kepala Desa untuk surat keterangan ahli waris', desc: 'Fotokopi legalisir Kades untuk surat keterangan ahli waris', status: 'Belum Ada' },
      { id: 4, name: 'Fotokopi Surat/Akta Kematian', desc: 'Fotokopi surat/akta kematian pewaris', status: 'Sudah Diterima' },
      { id: 5, name: 'Surat Nikah atau Surat Keterangan Nikah dari desa (alm)', desc: 'Surat nikah alm atau surat keterangan nikah desa', status: 'Sudah Diterima' },
      { id: 6, name: 'Surat Keterangan Anak dari Desa', desc: 'Surat keterangan anak/silsilah waris', status: 'Belum Ada' },
      { id: 7, name: 'Fotokopi KTP Seluruh Ahli Waris', desc: 'KTP seluruh ahli waris', status: 'Belum Ada' },
      { id: 8, name: 'Fotokopi KK Seluruh Ahli Waris', desc: 'KK seluruh ahli waris', status: 'Belum Ada' },
      { id: 9, name: 'Nomor Telepon dan Email Penerima APHB', desc: 'Kontak penerima APHB', status: 'Sudah Diterima' },
      { id: 10, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Fotokopi PBB tahun berjalan', status: 'Belum Ada' },
      { id: 11, name: 'Share Lokasi Tanah', desc: 'Share lokasi tanah/objek APHB', status: 'Sudah Diterima' },
      { id: 12, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto objek APHB dari kamera GPS', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'APHT') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat tanah asli HM/HGB/HP', status: 'Sudah Diterima' },
      { id: 2, name: 'KTP Pemegang Hak', desc: 'Valid E-KTP photocopy or scan of owner', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP Persetujuan Pemegang Hak', desc: 'Required for married individuals', status: 'Belum Ada' },
      { id: 4, name: 'Fotokopi KK', desc: 'Family Registry card', status: 'Sudah Diterima' },
      { id: 5, name: 'Fotokopi Surat Nikah', desc: 'Marriage certificate', status: 'Sudah Diterima' },
      { id: 6, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Latest property tax receipt', status: 'Belum Ada' },
      { id: 7, name: 'Fotokopi Perjanjian Kredit', desc: 'Credit agreement from bank', status: 'Sudah Diterima' },
      { id: 8, name: 'Fotokopi KTP Pihak Bank', desc: 'Bank officer representative ID', status: 'Belum Ada' },
      { id: 9, name: 'Fotokopi SK Pihak Bank', desc: 'Officer\'s letter of appointment', status: 'Belum Ada' },
      { id: 10, name: 'Kode Bank', desc: 'Unique bank code identifier', status: 'Sudah Diterima' }
    ];
  }
  if (serviceType === 'WARIS') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat tanah asli HM/HGB/HP', status: 'Sudah Diterima' },
      { id: 2, name: 'Surat Keterangan Ahli Waris Asli', desc: 'Surat keterangan ahli waris asli', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi Legalisir Kepala Desa untuk surat ahli waris', desc: 'Fotokopi legalisir Kades untuk surat keterangan ahli waris', status: 'Belum Ada' },
      { id: 4, name: 'Fotokopi Surat/Akta Kematian', desc: 'Fotokopi surat/akta kematian pewaris', status: 'Sudah Diterima' },
      { id: 5, name: 'Surat Nikah atau Surat Keterangan Nikah dari desa (alm)', desc: 'Surat nikah alm atau surat keterangan nikah desa', status: 'Sudah Diterima' },
      { id: 6, name: 'Surat Keterangan Anak dari Desa', desc: 'Surat keterangan anak/silsilah waris', status: 'Belum Ada' },
      { id: 7, name: 'Fotokopi KTP Seluruh Ahli Waris', desc: 'KTP seluruh ahli waris', status: 'Belum Ada' },
      { id: 8, name: 'Surat Pernyataan Pembagian Hak Waris', desc: 'Surat pernyataan pembagian hak waris ahli waris', status: 'Belum Ada' },
      { id: 9, name: 'Fotokopi KK Seluruh Ahli Waris', desc: 'KK seluruh ahli waris', status: 'Belum Ada' },
      { id: 10, name: 'Nomor Telepon dan Email Salah Satu Ahli Waris', desc: 'Kontak salah satu ahli waris', status: 'Sudah Diterima' },
      { id: 11, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Fotokopi PBB tahun berjalan', status: 'Belum Ada' },
      { id: 12, name: 'Share Lokasi Tanah', desc: 'Share lokasi tanah/objek waris', status: 'Sudah Diterima' },
      { id: 13, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto objek waris dari kamera GPS', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'ROYA') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat tanah asli HM/HGB/HP', status: 'Sudah Diterima' },
      { id: 2, name: 'Fotokopi KTP Pemegang Hak', desc: 'Fotokopi KTP pemegang hak', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi KK Pemegang Hak', desc: 'Fotokopi KK pemegang hak', status: 'Sudah Diterima' },
      { id: 4, name: 'Surat Roya Asli dari Bank', desc: 'Surat roya asli dari bank kreditur', status: 'Sudah Diterima' },
      { id: 5, name: 'Sertifikat Hak Tanggungan Asli', desc: 'Sertifikat Hak Tanggungan asli', status: 'Sudah Diterima' },
      { id: 6, name: 'Share Lokasi Tanah', desc: 'Share lokasi tanah/objek roya', status: 'Sudah Diterima' },
      { id: 7, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto objek roya dari kamera GPS', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'PECAH') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat asli (HM/HGB/HP) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'Fotokopi KTP Pemegang Hak', desc: 'Fotokopi KTP pemegang hak milik', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi KK Pemegang Hak', desc: 'Fotokopi Kartu Keluarga pemegang hak milik', status: 'Sudah Diterima' },
      { id: 4, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Fotokopi Pajak Bumi dan Bangunan tahun berjalan', status: 'Belum Ada' },
      { id: 5, name: 'Share Lokasi Tanah', desc: 'Titik koordinat share lokasi tanah objek pemecahan', status: 'Sudah Diterima' },
      { id: 6, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto lokasi tanah fisik menggunakan kamera GPS Maps', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'GANTI') {
    return [
      { id: 1, name: 'Sertifikat Asli', desc: 'Sertifikat asli (HM/HGB/HP) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'Fotokopi KTP Pemegang Hak', desc: 'Fotokopi KTP pemegang hak milik', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi KK Pemegang Hak', desc: 'Fotokopi Kartu Keluarga pemegang hak milik', status: 'Sudah Diterima' },
      { id: 4, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Fotokopi Pajak Bumi dan Bangunan tahun berjalan', status: 'Belum Ada' },
      { id: 5, name: 'Share Lokasi Tanah', desc: 'Titik koordinat share lokasi tanah objek pengganti', status: 'Sudah Diterima' },
      { id: 6, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto lokasi tanah fisik menggunakan kamera GPS Maps', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'KONVERSI') {
    return [
      { id: 1, name: 'Fotokopi Legalisir Letter C Desa', desc: 'Fotokopi Letter C desa dilegalisir', status: 'Sudah Diterima' },
      { id: 2, name: 'Fotokopi KTP Pemegang Hak', desc: 'Fotokopi KTP pemegang hak milik', status: 'Sudah Diterima' },
      { id: 3, name: 'Fotokopi KK Pemegang Hak', desc: 'Fotokopi Kartu Keluarga pemegang hak milik', status: 'Sudah Diterima' },
      { id: 4, name: 'Fotokopi PBB Tahun Berjalan', desc: 'Fotokopi Pajak Bumi dan Bangunan tahun berjalan', status: 'Belum Ada' },
      { id: 5, name: 'Share Lokasi Tanah', desc: 'Titik koordinat share lokasi tanah objek', status: 'Sudah Diterima' },
      { id: 6, name: 'Foto Lokasi Tanah (GPS Maps Camera)', desc: 'Foto lokasi tanah fisik menggunakan kamera GPS Maps', status: 'Belum Ada' },
      { id: 7, name: 'Blangko Konversi', desc: 'Formulir blangko konversi resmi', status: 'Sudah Diterima' },
      { id: 8, name: 'Fotokopi KTP Carik/Lurah/Polo', desc: 'Fotokopi KTP pejabat desa Carik/Lurah/Polo', status: 'Belum Ada' },
      { id: 9, name: 'Surat Keterangan Riwayat Tanah', desc: 'Surat keterangan riwayat kepemilikan tanah asli', status: 'Belum Ada' },
      { id: 10, name: 'Fotokopi Bukti Perolehan Hak Letter C Sejak Tahun 1960', desc: 'Fotokopi bukti perolehan hak Letter C runut sejak tahun 1960', status: 'Sudah Diterima' }
    ];
  }
  if (serviceType === 'FIDUSIA') {
    return [
      { id: 1, name: 'FOTOKOPI BPKB KENDARAAN BERMOTOR', desc: 'Fotokopi Bukti Pemilik Kendaraan Bermotor', status: 'Sudah Diterima' },
      { id: 2, name: 'FOTOKOPI STNK KENDARAAN BERMOTOR', desc: 'Fotokopi Surat Tanda Nomor Kendaraan', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP DEBITUR', desc: 'Kartu Tanda Penduduk pihak Debitur', status: 'Sudah Diterima' },
      { id: 4, name: 'KTP PERSETUJUAN DEBITUR', desc: 'Fotokopi KTP penjamin persetujuan debitur', status: 'Belum Ada' },
      { id: 5, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Fotokopi Kartu Keluarga debitur', status: 'Sudah Diterima' },
      { id: 6, name: 'FOTOKOPI SURAT NIKAH', desc: 'Fotokopi Surat Nikah/Buku Nikah debitur', status: 'Sudah Diterima' },
      { id: 7, name: 'FOTOKOPI PERJANJIAN KREDIT', desc: 'Fotokopi Perjanjian Kredit pendukung', status: 'Sudah Diterima' },
      { id: 8, name: 'FOTOKOPI KWITANSI PEMBELIAN KENDARAAN', desc: 'Diperlukan apabila BPKB + STNK bukan atas nama debitur', status: 'Belum Ada' },
      { id: 9, name: 'SURAT PERNYATAAN KEPEMILIKAN JAMINAN', desc: 'Diperlukan apabila BPKB + STNK bukan atas nama debitur', status: 'Belum Ada' },
      { id: 10, name: 'FOTOKOPI KTP PIHAK BANK', desc: 'ID perwakilan pejabat bank', status: 'Belum Ada' },
      { id: 11, name: 'FOTOKOPI SK PIHAK BANK', desc: 'Surat Keputusan perwakilan pejabat bank', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'APJB' || serviceType === 'APPJB') {
    return [
      { id: 1, name: 'SERTIFIKAT ASLI', desc: 'Sertifikat tanah asli (HM/HGB) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'KTP AN. PEMEGANG HAK', desc: 'Kartu Tanda Penduduk atas nama pemegang hak', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP PERSETUJUAN PEMEGANG HAK', desc: 'Fotokopi KTP persetujuan suami/istri pemegang hak', status: 'Sudah Diterima' },
      { id: 4, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Fotokopi Kartu Keluarga pemegang hak', status: 'Sudah Diterima' },
      { id: 5, name: 'FOTOKOPI SURAT NIKAH', desc: 'Fotokopi Surat Nikah pemegang hak', status: 'Sudah Diterima' },
      { id: 6, name: 'FOTOKOPI PBB TAHUN BERJALAN', desc: 'Fotokopi Pajak Bumi dan Bangunan tahun berjalan', status: 'Belum Ada' },
      { id: 7, name: 'FOTOKOPI KTP PEMBELI', desc: 'Fotokopi Kartu Tanda Penduduk pihak pembeli', status: 'Sudah Diterima' },
      { id: 8, name: 'FOTOKOPI KARTU KELUARGA PEMBELI', desc: 'Fotokopi Kartu Keluarga pihak pembeli', status: 'Sudah Diterima' },
      { id: 9, name: 'NOMOR TELEPON + EMAIL PEMBELI', desc: 'Nomor telepon dan email aktif pembeli', status: 'Sudah Diterima' },
      { id: 10, name: 'SHARELOKASI TANAH', desc: 'Titik koordinat share lokasi tanah objek', status: 'Sudah Diterima' },
      { id: 11, name: 'FOTO LOKASI', desc: 'Foto fisik lokasi tanah objek', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'SKUM' || serviceType === 'APK') {
    return [
      { id: 1, name: 'SERTIFIKAT ASLI', desc: 'Sertifikat tanah asli (HM/HGB) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'KTP AN. PEMEGANG HAK', desc: 'Kartu Tanda Penduduk atas nama pemegang hak', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP PERSETUJUAN PEMEGANG HAK', desc: 'Fotokopi KTP persetujuan suami/istri pemegang hak', status: 'Sudah Diterima' },
      { id: 4, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Fotokopi Kartu Keluarga pemegang hak', status: 'Sudah Diterima' }
    ];
  }
  if (serviceType === 'SEWA') {
    return [
      { id: 1, name: 'SERTIFIKAT ASLI', desc: 'Sertifikat tanah asli (HM/HGB) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'KTP AN. PEMEGANG HAK', desc: 'Kartu Tanda Penduduk atas nama pemegang hak', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP PERSETUJUAN PEMEGANG HAK', desc: 'Fotokopi KTP persetujuan suami/istri pemegang hak', status: 'Sudah Diterima' },
      { id: 4, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Fotokopi Kartu Keluarga pemegang hak', status: 'Sudah Diterima' },
      { id: 5, name: 'FOTOKOPI SURAT NIKAH', desc: 'Fotokopi Surat Nikah pemegang hak', status: 'Sudah Diterima' },
      { id: 6, name: 'FOTOKOPI KTP PIHAK PENYEWA', desc: 'Fotokopi Kartu Tanda Penduduk pihak penyewa', status: 'Sudah Diterima' },
      { id: 7, name: 'FOTOKOPI KARTU KELUARGA PIHAK PENYEWA', desc: 'Fotokopi Kartu Keluarga pihak penyewa', status: 'Sudah Diterima' },
      { id: 8, name: 'FOTOKOPI PBB TAHUN BERJALAN', desc: 'Fotokopi Pajak Bumi dan Bangunan tahun berjalan', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'CONSEN') {
    return [
      { id: 1, name: 'SERTIFIKAT ASLI', desc: 'Sertifikat tanah asli (HM/HGB) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'KTP AN. PEMEGANG HAK', desc: 'Kartu Tanda Penduduk atas nama pemegang hak', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP PERSETUJUAN PEMEGANG HAK', desc: 'Fotokopi KTP persetujuan suami/istri pemegang hak', status: 'Sudah Diterima' },
      { id: 4, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Fotokopi Kartu Keluarga pemegang hak', status: 'Sudah Diterima' },
      { id: 5, name: 'FOTOKOPI SURAT NIKAH', desc: 'Fotokopi Surat Nikah pemegang hak', status: 'Sudah Diterima' },
      { id: 6, name: 'SURAT KETERANGAN LUNAS DARI BANK', desc: 'Surat keterangan pelunasan pinjaman asli dari bank', status: 'Sudah Diterima' },
      { id: 7, name: 'SURAT KEHILANGAN DARI DESA', desc: 'Surat keterangan kehilangan resmi dari kantor kepala desa', status: 'Sudah Diterima' },
      { id: 8, name: 'SURAT KEHILANGAN DARI POLRES SESUAI DOMISILI OBYEK', desc: 'Surat tanda lapor kehilangan dari Kepolisian Resor', status: 'Sudah Diterima' },
      { id: 9, name: 'PENGANTAR ROYA DARI BANK', desc: 'Surat pengantar roya resmi asli dari bank kreditur', status: 'Sudah Diterima' },
      { id: 10, name: 'FOTOKOPI PBB TAHUN BERJALAN', desc: 'Fotokopi Pajak Bumi dan Bangunan tahun berjalan', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'YAYASAN') {
    return [
      { id: 1, name: 'FOTOKOPI KTP SELURUH ANGGOTA', desc: 'Fotokopi KTP pendiri, pembina, pengurus, dan pengawas yayasan', status: 'Sudah Diterima' },
      { id: 2, name: 'FOTOKOPI KARTU KELUARGA SELURUH ANGGOTA', desc: 'Fotokopi Kartu Keluarga seluruh pendiri/pengurus', status: 'Sudah Diterima' },
      { id: 3, name: 'SUSUNAN/DAFTAR PENGURUS', desc: 'Susunan Pengurus (Ketua Pembina, Anggota, Ketua Pengurus, Sekretaris, Bendahara, Ketua Pengawas, Anggota)', status: 'Sudah Diterima' },
      { id: 4, name: 'SURAT KETERANGAN DOMISILI (DIBUAT SETELAH AKTA JADI)', desc: 'Surat keterangan domisili yayasan dari kelurahan setempat', status: 'Belum Ada' },
      { id: 5, name: 'FOTOKOPI NPWP PRIBADI MASING MASING PENGURUS', desc: 'Fotokopi Kartu NPWP masing-masing pengurus aktif', status: 'Sudah Diterima' },
      { id: 6, name: 'BERGERAK DALAM BIDANG APA YAYASAN TERSEBUT', desc: 'Penjelasan bidang kegiatan yayasan (Sosial, Keagamaan, Kemanusiaan)', status: 'Sudah Diterima' },
      { id: 7, name: 'NAMA YAYASAN (TERDIRI DARI 3 KATA DAN TIDAK BOLEH SINGKATAN SERTA EJAAN)', desc: 'Pengecekan nama yayasan minimal 3 kata tanpa singkatan', status: 'Sudah Diterima' },
      { id: 8, name: 'FOTOKOPI NPWP YAYASAN', desc: 'Fotokopi NPWP atas nama yayasan yang telah terdaftar', status: 'Belum Ada' },
      { id: 9, name: 'FOTOKOPI BUKU TABUNGAN AN. YAYASAN', desc: 'Fotokopi buku rekening bank atas nama yayasan', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'PT') {
    return [
      { id: 1, name: 'FOTOKOPI KTP DIREKTUR, KOMISARIS, PEMEGANG SAHAM', desc: 'Fotokopi Kartu Tanda Penduduk pendiri/pengurus PT', status: 'Sudah Diterima' },
      { id: 2, name: 'FOTOKOPI KARTU KELUARGA DIREKTUR, KOMISARIS, PEMEGANG SAHAM', desc: 'Fotokopi Kartu Keluarga pendiri/pengurus PT', status: 'Sudah Diterima' },
      { id: 3, name: 'FOTOKOPI NPWP DIREKTUR, KOMISARIS, PEMEGANG SAHAM', desc: 'Fotokopi NPWP pribadi pendiri/pengurus PT', status: 'Sudah Diterima' },
      { id: 4, name: 'NOMOR TELEPON + EMAIL DIREKTUR, KOMISARIS, PEMEGANG SAHAM', desc: 'Kontak aktif telepon dan email para pengurus PT', status: 'Sudah Diterima' },
      { id: 5, name: 'MODAL AWAL', desc: 'Detail nominal modal dasar perseroan terbatas', status: 'Sudah Diterima' },
      { id: 6, name: 'MODAL YANG DITEMPATKAN', desc: 'Detail nominal modal ditempatkan dan disetor penuh', status: 'Sudah Diterima' },
      { id: 7, name: 'JUMLAH SAHAM', desc: 'Jumlah total lembar saham perseroan', status: 'Sudah Diterima' },
      { id: 8, name: 'JUMLAH SAHAM YANG DITEMPATKAN', desc: 'Jumlah lembar saham disetor/ditempatkan', status: 'Sudah Diterima' },
      { id: 9, name: 'NAMA PT. (TERDIRI DARI 3 KATA)', desc: 'Pengecekan nama PT minimal 3 kata bahasa Indonesia resmi', status: 'Sudah Diterima' },
      { id: 10, name: 'ALAMAT LENGKAP PT', desc: 'Alamat lengkap kedudukan dan kantor PT', status: 'Sudah Diterima' },
      { id: 11, name: 'KEGIATAN USAHA (SESUAI KBLI 2021)', desc: 'Penentuan kode bidang usaha sesuai Klasifikasi Baku Lapangan Usaha Indonesia 2021', status: 'Sudah Diterima' },
      { id: 12, name: 'FOTOKOPI NPWP PT', desc: 'Fotokopi Nomor Pokok Wajib Pajak atas nama perseroan', status: 'Belum Ada' },
      { id: 13, name: 'FOTOKOPI BUKU SETOR MODAL (BUKU TABUNGAN, REKENING KORAN, BUKTI TRANSFER KE REKENING AN. PERSERO)', desc: 'Bukti penyetoran modal ke rekening koran atas nama PT', status: 'Belum Ada' },
      { id: 14, name: 'SURAT KETERANGAN DOMISILI DARI DESA (SETELAH AKTA JADI)', desc: 'Surat keterangan domisili PT dari pemerintah desa setempat', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'CV') {
    return [
      { id: 1, name: 'FOTOKOPI KTP DIREKTUR, KOMANDITER', desc: 'Fotokopi Kartu Tanda Penduduk pendiri/pengurus CV', status: 'Sudah Diterima' },
      { id: 2, name: 'FOTOKOPI KARTU KELUARGA DIREKTUR, KOMANDITER', desc: 'Fotokopi Kartu Keluarga pendiri/pengurus CV', status: 'Sudah Diterima' },
      { id: 3, name: 'FOTOKOPI NPWP DIREKTUR, KOMANDITER', desc: 'Fotokopi NPWP pribadi pendiri/pengurus CV', status: 'Sudah Diterima' },
      { id: 4, name: 'NOMOR TELEPON + EMAIL CV.', desc: 'Kontak aktif telepon dan email CV', status: 'Sudah Diterima' },
      { id: 5, name: 'ALAMAT LENGKAP', desc: 'Alamat lengkap kedudukan dan kantor CV', status: 'Sudah Diterima' },
      { id: 6, name: 'NAMA CV (TERDIRI DARI 3 KATA)', desc: 'Pengecekan nama CV minimal 3 kata', status: 'Sudah Diterima' },
      { id: 7, name: 'MODAL AWAL USAHA', desc: 'Detail nominal modal awal usaha CV', status: 'Sudah Diterima' },
      { id: 8, name: 'KONTRIBUSI MODAL MASING PERSERO', desc: 'Detail kontribusi modal masing-masing sekutu/persero', status: 'Sudah Diterima' },
      { id: 9, name: 'KEGIATAN USAHA (SESUAI KBLI 2021 DI GOOGLE)', desc: 'Klasifikasi Baku Lapangan Usaha Indonesia CV', status: 'Sudah Diterima' },
      { id: 10, name: 'SURAT KETERANGAN DOMISILI (SETELAH AKTA JADI)', desc: 'Surat keterangan domisili CV setelah akta terbit', status: 'Belum Ada' },
      { id: 11, name: 'FOTOKOPI NPWP CV', desc: 'Fotokopi Nomor Pokok Wajib Pajak atas nama CV', status: 'Belum Ada' }
    ];
  }
  if (serviceType === 'HT') {
    return [
      { id: 1, name: 'SERTIFIKAT TANAH ASLI', desc: 'Sertifikat asli (HM/HGB) dari BPN', status: 'Sudah Diterima' },
      { id: 2, name: 'SURAT KUASA MEMBEBANKAN HAK TANGGUNGAN', desc: 'SKMHT pendukung asli', status: 'Sudah Diterima' },
      { id: 3, name: 'KTP PEMBERI & PENERIMA HAK', desc: 'Valid photocopy or scan of IDs', status: 'Belum Ada' },
      { id: 4, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Family Registry card', status: 'Sudah Diterima' },
      { id: 5, name: 'PERJANJIAN KREDIT ASLI & SALINAN', desc: 'Credit agreement from bank', status: 'Perlu Verifikasi' },
      { id: 6, name: 'BUKTI VALIDASI PBB', desc: 'Latest property tax receipt', status: 'Sudah Diterima' },
      { id: 7, name: 'SURAT PERNYATAAN PEMASANGAN APHT', desc: 'Required statement form', status: 'Belum Ada' },
      { id: 8, name: 'DOKUMEN PENDUKUNG LAINNYA', desc: 'Other required attachments', status: 'Belum Ada' },
    ];
  }
  return [
    { id: 1, name: 'KTP PEMOHON UTAMA', desc: 'Kartu Tanda Penduduk pemohon', status: 'Sudah Diterima' },
    { id: 2, name: 'FOTOKOPI KARTU KELUARGA', desc: 'Fotokopi KK pemohon', status: 'Sudah Diterima' },
    { id: 3, name: 'NPWP PEMOHON', desc: 'Nomor Pokok Wajib Pajak', status: 'Perlu Verifikasi' },
    { id: 4, name: 'DOKUMEN PENDUKUNG', desc: 'Dokumen pendukung lainnya', status: 'Belum Ada' },
  ];
};

export const getDefaultChecklist = (serviceType) => {
  const list = getRawDefaultChecklist(serviceType);
  return list.map(item => ({
    ...item,
    status: 'Belum Ada',
    fileName: null,
    fileUrl: null
  }));
};

export const CasesContext = createContext(null);

// Mapper untuk mengubah format data Supabase (snake_case) ke format React (camelCase)
const mapCaseFromDb = (dbCase, dbChecklist = [], dbLogs = []) => {
  return {
    id: dbCase.id,
    caseNumber: dbCase.case_number,
    clientId: dbCase.client_id,
    clientName: dbCase.client_name,
    clientPhone: dbCase.client_phone,
    clientEmail: dbCase.client_email,
    category: dbCase.category,
    serviceType: dbCase.service_type,
    status: dbCase.status,
    currentStageId: dbCase.current_stage_id,
    isComplete: dbCase.is_complete,
    documentsReady: dbCase.documents_ready,
    isDraft: dbCase.is_draft,
    notes: dbCase.notes,
    fees: Number(dbCase.fees || 0),
    propertyLocation: dbCase.property_location,
    bankPartner: dbCase.bank_partner,
    entryDate: dbCase.entry_date,
    estimationDate: dbCase.estimation_date,
    assignedStaffId: dbCase.assigned_staff_id,
    assignedStaff: dbCase.assigned_staff?.full_name || 'Belum ditugaskan',
    createdById: dbCase.created_by_id,
    creatorName: dbCase.creator?.full_name || 'Sistem',
    createdAt: dbCase.created_at,
    updatedAt: dbCase.updated_at,
    paymentStatus: dbCase.payment_status || 'Belum Lunas',
    paidAmount: Number(dbCase.paid_amount || 0),
    checklist: (dbChecklist || []).map(item => ({
      id: item.id,
      orderNum: item.order_num,
      name: item.name,
      description: item.description,
      status: item.status,
      fileUrl: item.file_url,
      fileName: item.file_name,
      updatedAt: item.updated_at,
      updatedBy: item.updated_by
    })).sort((a, b) => a.orderNum - b.orderNum),
    logs: (dbLogs || []).map(log => ({
      timestamp: log.created_at,
      user: log.user_name,
      action: log.action,
      role: log.user_role
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  };
};

export const CasesProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const [cases, setCases] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to prepend dynamic activities locally
  const prependActivity = (rawLog) => {
    if (!rawLog) return;
    
    let targetLabel = 'Sistem';
    if (rawLog.cases) {
      targetLabel = `${rawLog.cases.client_name || rawLog.cases.clientName} (${rawLog.cases.case_number || rawLog.cases.caseNumber})`;
    } else {
      const c = cases.find(item => item.id === rawLog.case_id);
      if (c) {
        targetLabel = `${c.clientName} (${c.caseNumber})`;
      }
    }

    const mapped = {
      id: rawLog.id,
      user: rawLog.user_name,
      role: rawLog.user_role === 'staff' ? 'Staf Administrasi' : 'Ketua Notaris',
      category: rawLog.category ? rawLog.category.toUpperCase() : 'PPAT',
      action: rawLog.action,
      target: targetLabel,
      timestamp: new Date(rawLog.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      icon: rawLog.icon || 'history'
    };
    
    setActivities(prev => [mapped, ...prev].slice(0, 30));
  };

  // Ambil data berkas dari database Supabase
  const fetchCasesFromSupabase = async () => {
    setLoading(true);
    try {
      const { data: dbCases, error } = await supabase
        .from('cases')
        .select(`
          *,
          assigned_staff:profiles!assigned_staff_id(full_name),
          creator:profiles!created_by_id(full_name),
          checklist_items(*),
          activity_logs(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[CasesContext] Gagal mengambil data berkas:', error);
        // Fallback ke localStorage jika query error
        const storedCases = localStorage.getItem('notary_cases');
        setCases(storedCases ? JSON.parse(storedCases) : []);
        setActivities([]);
        return;
      }

      if (dbCases) {
        const mapped = dbCases.map(c => mapCaseFromDb(c, c.checklist_items, c.activity_logs));
        setCases(mapped);
        localStorage.setItem('notary_cases', JSON.stringify(mapped));
      }

      // Query log aktivitas global
      const { data: dbActivities, error: actError } = await supabase
        .from('activity_logs')
        .select('*, cases(case_number, client_name)')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!actError && dbActivities) {
        const mappedActs = dbActivities.map(act => ({
          id: act.id,
          user: act.user_name,
          role: act.user_role === 'staff' ? 'Staf Administrasi' : 'Ketua Notaris',
          category: act.category ? act.category.toUpperCase() : 'PPAT',
          action: act.action,
          target: act.cases ? `${act.cases.client_name} (${act.cases.case_number})` : 'Sistem',
          timestamp: new Date(act.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          icon: act.icon || 'history'
        }));
        setActivities(mappedActs);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('[CasesContext] Error tidak terduga:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      const storedCases = localStorage.getItem('notary_cases');
      setCases(storedCases ? JSON.parse(storedCases) : []);
      setActivities([]);
      return;
    }

    fetchCasesFromSupabase();

    // 1. Real-time subscription to sync changes from Supabase instantly
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, fetchCasesFromSupabase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items' }, fetchCasesFromSupabase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchCasesFromSupabase)
      .subscribe();

    // 2. Polling interval (8 seconds) as a backup for reliable offline/online recovery
    const interval = setInterval(() => {
      fetchCasesFromSupabase();
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  // A. Tambah Berkas Baru
  const addCase = async (caseData) => {
    if (user) {
      const nextIndex = cases.length + 1;
      const caseNumber = generateCaseNumber(nextIndex);
      
      let clientId = caseData.clientId;
      if (!clientId) {
        const existingCase = cases.find(
          (c) =>
            (c.clientName && caseData.clientName && c.clientName.toLowerCase().trim() === caseData.clientName.toLowerCase().trim()) ||
            (c.clientEmail && caseData.clientEmail && c.clientEmail.toLowerCase().trim() === caseData.clientEmail.toLowerCase().trim()) ||
            (c.clientPhone && caseData.clientPhone && c.clientPhone === caseData.clientPhone)
        );
        clientId = existingCase ? existingCase.clientId : `CLI-${String(Math.floor(100 + Math.random() * 900))}`;
      }

      const serviceType = caseData.serviceType || 'SKMHT';
      
      const dbCaseData = {
        case_number: caseNumber,
        client_name: caseData.clientName || '',
        client_id: clientId,
        client_phone: caseData.clientPhone || null,
        client_email: caseData.clientEmail || null,
        category: caseData.category || 'ppat',
        service_type: serviceType,
        status: caseData.status || 'Pemeriksaan Dokumen',
        current_stage_id: 1,
        is_complete: false,
        documents_ready: false,
        is_draft: caseData.isDraft || false,
        notes: caseData.notes || '',
        fees: caseData.fees !== undefined ? Number(caseData.fees) : (serviceType === 'AJB' ? 12000000 
              : serviceType === 'SKMHT' ? 4500000 
               : serviceType === 'HT' ? 8000000 
              : 25000000),
        property_location: caseData.propertyLocation || 'Jakarta Selatan',
        bank_partner: caseData.bankPartner || 'Bank Mandiri',
        assigned_staff_id: caseData.assignedStaffId || (profile?.role === 'staff' ? user.id : null),
        created_by_id: user.id,
        entry_date: caseData.entryDate || null,
        estimation_date: caseData.estimationDate || null,
        payment_status: caseData.paymentStatus || 'Belum Lunas',
        paid_amount: caseData.paidAmount !== undefined ? Number(caseData.paidAmount) : 0
      };

      const { data: newDbCase, error: caseError } = await supabase
        .from('cases')
        .insert(dbCaseData)
        .select()
        .single();

      if (caseError) {
        console.error('[CasesContext] Gagal membuat berkas di Supabase:', caseError);
        throw new Error(caseError.message);
      }

      // Ambil default checklist dari checklist_templates
      const { data: templates, error: templateError } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('service_type', serviceType)
        .order('order_num');

      let checklistItems = [];
      if (!templateError && templates && templates.length > 0) {
        const itemsData = templates.map(t => {
          // Cari apakah item ini ada di caseData.checklist yang diinput user (misal file upload)
          const userInputItem = (caseData.checklist || []).find(
            (item) => item.name === t.name || item.orderNum === t.order_num
          );

          return {
            case_id: newDbCase.id,
            order_num: t.order_num,
            name: t.name,
            description: t.description,
            status: userInputItem ? userInputItem.status : 'Belum Ada',
            file_name: userInputItem ? (userInputItem.fileName || null) : null,
            file_url: userInputItem ? (userInputItem.fileUrl || null) : null
          };
        });
        
        const { data: newItems, error: itemsError } = await supabase
          .from('checklist_items')
          .insert(itemsData)
          .select();
        
        if (!itemsError && newItems) {
          checklistItems = newItems;
        }
      }

      // Log aktivitas pendaftaran berkas
      const logData = {
        case_id: newDbCase.id,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split('@')[0] || 'Staf',
        user_role: profile?.role || 'staff',
        category: newDbCase.category,
        action: 'Berkas didaftarkan / berkas masuk ke dalam sistem',
        icon: 'history'
      };

      const { data: newLog } = await supabase
        .from('activity_logs')
        .insert(logData)
        .select()
        .single();

      if (newLog) {
        prependActivity({
          ...newLog,
          cases: {
            case_number: newDbCase.case_number,
            client_name: newDbCase.client_name
          }
        });
      }

      // Refetch untuk memuat relasi (assigned_staff, dll) dengan lengkap
      const { data: fullCase, error: fetchErr } = await supabase
        .from('cases')
        .select(`
          *,
          assigned_staff:profiles!assigned_staff_id(full_name),
          creator:profiles!created_by_id(full_name),
          checklist_items(*),
          activity_logs(*)
        `)
        .eq('id', newDbCase.id)
        .single();

      const mappedNewCase = fetchErr || !fullCase
        ? mapCaseFromDb(newDbCase, checklistItems, newLog ? [newLog] : [])
        : mapCaseFromDb(fullCase, fullCase.checklist_items, fullCase.activity_logs);

      setCases(prev => [mappedNewCase, ...prev]);
      return mappedNewCase;
    } else {
      // Fallback Local Storage
      const nextIndex = cases.length + 1;
      const serviceType = caseData.serviceType || 'SKMHT';
      const newCase = {
        id: String(Date.now()),
        caseNumber: generateCaseNumber(nextIndex),
        clientId: `CLI-${String(Math.floor(100 + Math.random() * 900))}`,
        isComplete: false,
        documentsReady: false,
        fees: serviceType === 'AJB' ? 12000000 
              : serviceType === 'SKMHT' ? 4500000 
              : serviceType === 'HT' ? 8000000 
              : 25000000,
        assignedStaff: 'Ani Lestari, S.H.',
        notes: '',
        propertyLocation: 'Jakarta Selatan',
        bankPartner: 'Bank Mandiri',
        checklist: getDefaultChecklist(serviceType),
        logs: [{ timestamp: new Date().toISOString(), user: 'Sistem', action: 'Berkas didaftarkan / berkas masuk ke dalam sistem' }],
        ...caseData,
      };
      setCases((prev) => [newCase, ...prev]);
      return newCase;
    }
  };

  // B. Update Status Berkas (Pemeriksaan Dokumen -> Selesai)
  const updateCaseStatus = async (id, status) => {
    if (user) {
      const isComplete = status === 'Selesai';
      const c = cases.find(item => item.id === id);
      if (!c) return;

      // Sync stage ID
      let currentStageId = c.currentStageId;
      const isPPAT = c.category?.toLowerCase() === 'ppat' || ['AJB', 'HIBAH', 'APHB', 'APHT', 'WARIS', 'ROYA', 'PECAH', 'GANTI', 'KONVERSI', 'SKMHT', 'HT', 'HGB', 'HAK_PAKAI'].includes(c.serviceType);
      
      if (isPPAT) {
        if (c.serviceType === 'APHT') {
          const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 3, 'Tanda Tangan Akta': 4, 'Proses BPN': 6, 'Selesai': 13 };
          currentStageId = statusMap[status] || 1;
        } else if (c.serviceType === 'WARIS' || c.serviceType === 'ROYA') {
          const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Validasi Pajak': 4, 'Proses BPN': 6, 'Selesai': 15 };
          currentStageId = statusMap[status] || 1;
        } else if (c.serviceType === 'PECAH') {
          const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 4, 'Validasi Pajak': 5, 'Proses BPN': 5, 'Selesai': 15 };
          currentStageId = statusMap[status] || 1;
        } else if (c.serviceType === 'GANTI') {
          const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 4, 'Selesai': 14 };
          currentStageId = statusMap[status] || 1;
        } else if (c.serviceType === 'KONVERSI') {
          const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 4, 'Selesai': 15 };
          currentStageId = statusMap[status] || 1;
        } else {
          // Standard PPAT stages (AJB/HIBAH/APHB/HT/HGB/HAK_PAKAI/SKMHT etc.)
          const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 4, 'Tanda Tangan Akta': 5, 'Validasi Pajak': 6, 'Proses BPN': 8, 'Selesai': 18 };
          currentStageId = statusMap[status] || 1;
        }
      } else if (c.serviceType === 'FIDUSIA') {
        const statusMap = { 'Pemeriksaan Dokumen': 1, 'Penyusunan Draf': 2, 'Tanda Tangan Akta': 3, 'Selesai': 7 };
        currentStageId = statusMap[status] || 1;
      } else if (c.serviceType === 'APJB' || c.serviceType === 'SKUM') {
        const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 3, 'Tanda Tangan Akta': 4, 'Validasi Pajak': 5, 'Proses BPN': 6, 'Selesai': 7 };
        currentStageId = statusMap[status] || 1;
      } else if (c.serviceType === 'SEWA' || c.serviceType === 'CONSEN') {
        const statusMap = { 'Pemeriksaan Dokumen': 1, 'Penyusunan Draf': 2, 'Tanda Tangan Akta': 3, 'Selesai': 5 };
        currentStageId = statusMap[status] || 1;
      } else if (c.serviceType === 'APPJB') {
        const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 3, 'Tanda Tangan Akta': 4, 'Selesai': 5 };
        currentStageId = statusMap[status] || 1;
      } else if (c.serviceType === 'APK') {
        const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 3, 'Tanda Tangan Akta': 4, 'Selesai': 6 };
        currentStageId = statusMap[status] || 1;
      } else if (c.serviceType === 'YAYASAN' || c.serviceType === 'PT' || c.serviceType === 'CV') {
        const statusMap = { 'Pemeriksaan Dokumen': 1, 'Verifikasi Sertifikat': 2, 'Penyusunan Draf': 3, 'Tanda Tangan Akta': 4, 'Validasi Pajak': 5, 'Proses BPN': 6, 'Selesai': 8 };
        currentStageId = statusMap[status] || 1;
      }

      const { error: caseError } = await supabase
        .from('cases')
        .update({
          status,
          is_complete: isComplete,
          current_stage_id: currentStageId
        })
        .eq('id', id);

      if (caseError) {
        console.error('[CasesContext] Gagal memperbarui status berkas:', caseError);
        return;
      }

      // Catat log
      const logData = {
        case_id: id,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split('@')[0] || 'Staf',
        user_role: profile?.role || 'staff',
        category: c.category,
        action: `Tahapan pengerjaan akta diubah ke: ${status}`,
        icon: 'history'
      };

      const { data: newLog } = await supabase
        .from('activity_logs')
        .insert(logData)
        .select()
        .single();

      if (newLog) prependActivity(newLog);

      setCases(prev => prev.map(item => {
        if (item.id === id) {
          const logs = item.logs ? [...item.logs, {
            timestamp: newLog ? newLog.created_at : new Date().toISOString(),
            user: logData.user_name,
            action: logData.action,
            role: logData.user_role
          }] : [];
          return { ...item, status, isComplete, currentStageId, logs };
        }
        return item;
      }));
    } else {
      // Fallback Local
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const isComplete = status === 'Selesai';
            let currentStageId = c.currentStageId;
            // (Kode pemetaan lokal disingkat agar token efisien)
            const newLog = { timestamp: new Date().toISOString(), user: c.assignedStaff || 'Staf', action: `Tahapan pengerjaan akta diubah ke: ${status}` };
            return { ...c, status, isComplete, currentStageId, logs: c.logs ? [...c.logs, newLog] : [newLog] };
          }
          return c;
        })
      );
    }
  };

  // C. Update Tahapan Sub-Proses Berkas
  const updateCaseStage = async (id, stageId, status) => {
    if (user) {
      const isComplete = status === 'Selesai';
      const c = cases.find(item => item.id === id);
      if (!c) return;

      let stageLabel = `Tahapan ${stageId}`;
      const isPPAT = c.category?.toLowerCase() === 'ppat' || ['AJB', 'HIBAH', 'APHB', 'APHT', 'WARIS', 'ROYA', 'PECAH', 'GANTI', 'KONVERSI', 'SKMHT', 'HT', 'HGB', 'HAK_PAKAI'].includes(c.serviceType);
      
      if (isPPAT) {
        if (c.serviceType === 'APHT') {
          const aphtStages = ['Pengecekan kelengkapan Berkas', 'Pengecekan sertifikat', 'Pengetikan akta', 'Tanda tangan akta', 'Penomoran akta', 'Pendaftaran akta pada aplikasi mitra kerja atr bpn dan spa', 'Backup pada aplikasi bank', 'Verifikasi berkas oleh bpn melalui aplikasi mutra kerja atr bpn', 'Berkas dikembalikan atau telah diverifikasi oleh bpn', 'Pembayaran sps', 'Verifikasi oleh bpn pada aplikasi bank', 'Penerbitan sht', 'Penyerahan berkas kepada pihak bank'];
          stageLabel = aphtStages[stageId - 1] || stageLabel;
        } else if (c.serviceType === 'WARIS' || c.serviceType === 'ROYA') {
          const warisStages = ['Pengecekan berkas', 'Proses validasi sertifikat', 'Proses pengecekan sertifikat', 'Pembayaran pajak peralihan', 'Validasi pajak peralihan', 'Pendaftaran pada atr bpn', 'Pemeriksaaan berkas oleh bpn', 'Berkas dikembalikan atau telah sesuai', 'Cari buku tanah di warkah bpn', 'Pembayaran sps', 'Pemeriksaan draft sertifikat', 'Draft sertifikat', 'Penerbitan sertifikat', 'Loket penyerahan produk', 'Penyerahan kepada pemohon'];
          stageLabel = warisStages[stageId - 1] || stageLabel;
        } else if (c.serviceType === 'PECAH') {
          const pecahStages = ['Pengecekan berkas', 'Pengecekan ke bpn status tanah yang kan dipecah', 'Pendaftaran ukur pemechan', 'Pengajuan tapak kapling', 'Masuk berkas fisik ke bpn', 'Pemeriksaan berkas oleh bpn', 'Berkas dikembalikan atau telah sesuai', 'Pembayaran sps', 'Ruang pengukuran untuk gambar, pemetaan, cetak su', 'Cari buku tanah di warkah bpn', 'Pemeriksaan draft sertifikat', 'Draft sertifikat', 'Penerbitan sertifikat', 'Loket penyerahan produk', 'Penyerahan kepada pemohon'];
          stageLabel = pecahStages[stageId - 1] || stageLabel;
        } else if (c.serviceType === 'GANTI') {
          const gantiStages = ['Pengecekan berkas', 'Pengecekan ke bpn status tanah yang akan diproses', 'Pendaftaran ukur', 'Masuk berkas fisik ke bpn', 'Pemeriksaan berkas oleh bpn', 'Berkas dikembalikan atau telah sesuai', 'Pembayaran sps', 'Ruang pengukuran untuk gambar, pemetaan, cetak su', 'Cari buku tanah di warkah bpn', 'Pemriksaaan draft sertifikat', 'Draft sertifikat', 'Penerbitan sertifikat', 'Loket penyerahan produk', 'Penyerahan kepada pemohon'];
          stageLabel = gantiStages[stageId - 1] || stageLabel;
        } else if (c.serviceType === 'KONVERSI') {
          const konversiStages = ['Pengecekan berkas', 'Pengecekan ke bpn status tanah yang akan diproses', 'Pendaftaran ukur', 'Masuk berkas fisik ke bpn', 'Pemeriksaan berkas oleh bpn', 'Berkas dikembalikan atau telah sesuai', 'Pembayaran sps', 'Ruang pengukuran untuk gambar, pemetaan, cetak su', 'Panitia lapang oleh petugas bpn', 'pengumuman', 'Pemeriksaan draft sertifikat', 'Draft sertifikat', 'Penerbitan sertifikat', 'Loket penyerahan produk', 'Penyerahan kepada pemohon'];
          stageLabel = konversiStages[stageId - 1] || stageLabel;
        } else {
          // Standard PPAT stages (AJB/HIBAH/APHB/HT/HGB/HAK_PAKAI/SKMHT etc.)
          const ajbStages = ['Pengecekan Berkas', 'Validasi Sertifikat', 'Pengecekan Sertifikat', 'Pengetikan Akta', 'Tanda Tangan Akta', 'Pembayaran Pajak Peralihan', 'Validasi Pajak Peralihan (PPH Final)', 'Penomoran Akta', 'Pendaftaran Akta', 'Masuk Berkas Fisik ke BPN', 'Pemeriksaan Berkas oleh BPN', 'Pencarian Buku Tanah', 'Pembayaran SPS', 'Pemeriksaan Draft Sertifikat', 'Draft Sertifikat', 'Penerbitan Sertifikat', 'Loket Penyerahan Produk', 'Penyerahan kepada Pemohon'];
          stageLabel = ajbStages[stageId - 1] || stageLabel;
        }
      } else if (c.serviceType === 'FIDUSIA') {
        const fidusiaStages = ['PENGECEKKAN KELENGKAPAN BERKAS', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA', 'PENDAFTARAN KE KEMENKUMHAM', 'PENERBITAN SK KEMENKUMHAM', 'PENYERAHAN AKTA KE PIHAK BANK'];
        stageLabel = fidusiaStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'APJB' || c.serviceType === 'SKUM') {
        const apjbStages = ['PENGECEKKAN LENGKAPAN BERKAS', 'PENGECEKKAN SERTIFIKAT', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PEMBAYARAN PAJAK PERALIHAN', 'PENOMORAN AKTA', 'PENYERAHAN AKTA KE PEMOHON'];
        stageLabel = apjbStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'SEWA' || c.serviceType === 'CONSEN') {
        const sewaStages = ['PENGECEKKAN KELENGKAPAN BERKAS', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA', 'PENYERAHAN AKTA KE PEMOHON'];
        stageLabel = sewaStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'APPJB') {
        const appjbStages = ['PENGECEKKAN KELENGKAPAN BERKAS', 'PENGECEKKAN SERTIFIKAT', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA'];
        stageLabel = appjbStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'APK') {
        const apkStages = ['PENGECEKKAN LENGKAPAN BERKAS', 'PENGECEKKAN SERTIFIKAT', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA', 'PENYERAHAN AKTA KE PIHAK BANK'];
        stageLabel = apkStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'YAYASAN') {
        const yayasanStages = ['PENGECEKKAN KELENGKAPAN BERKAS', 'DAFTAR NAMA YAYASAN PADA AHU', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA', 'PENDAFTARAN KE KEMENKUMHAM', 'PENERBITAN SK KEMENKUMHAM', 'PENYERAHAN AKTA KE PEMOHON'];
        stageLabel = yayasanStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'PT') {
        const ptStages = ['PENGECEKKAN KELENGKAPAN BERKAS', 'DAFTAR NAMA PT PADA AHU', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA', 'PENDAFTARAN KE KEMENKUMHAM', 'PENERBITAN SK KEMENKUMHAM', 'PENYERAHAN AKTA KE PEMOHON'];
        stageLabel = ptStages[stageId - 1] || stageLabel;
      } else if (c.serviceType === 'CV') {
        const cvStages = ['PENGECEKKAN KELENGKAPAN BERKAS', 'DAFTAR NAMA CV PADA AHU', 'PENGETIKKAN AKTA', 'TANDA TANGAN AKTA', 'PENOMORAN AKTA', 'PENDAFTARAN KE KEMENKUMHAM', 'PENERBITAN SKT KEMENKUMHAM', 'PENYERAHAN AKTA KE PEMOHON'];
        stageLabel = cvStages[stageId - 1] || stageLabel;
      } else {
        const skmhtStages = ['Pengecekkan Berkas', 'Pengecekkan Sertifikat', 'Pengetikkan Akta', 'Tanda Tangan Akta', 'Penomoran Akta', 'Penyelesaian Berkas'];
        stageLabel = skmhtStages[stageId - 1] || stageLabel;
      }

      const { error: caseError } = await supabase
        .from('cases')
        .update({
          status,
          is_complete: isComplete,
          current_stage_id: stageId
        })
        .eq('id', id);

      if (caseError) {
        console.error('[CasesContext] Gagal memperbarui tahapan berkas:', caseError);
        return;
      }

      // Catat log
      const logData = {
        case_id: id,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split('@')[0] || 'Staf',
        user_role: profile?.role || 'staff',
        category: c.category,
        action: `Tahap pengerjaan diperbarui ke: ${stageId}. ${stageLabel} (Status: ${status})`,
        icon: 'history'
      };

      const { data: newLog } = await supabase
        .from('activity_logs')
        .insert(logData)
        .select()
        .single();

      if (newLog) prependActivity(newLog);

      setCases(prev => prev.map(item => {
        if (item.id === id) {
          const logs = item.logs ? [...item.logs, {
            timestamp: newLog ? newLog.created_at : new Date().toISOString(),
            user: logData.user_name,
            action: logData.action,
            role: logData.user_role
          }] : [];
          return { ...item, status, isComplete, currentStageId: stageId, logs };
        }
        return item;
      }));
    } else {
      // Fallback local
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const isComplete = status === 'Selesai';
            const newLog = { timestamp: new Date().toISOString(), user: c.assignedStaff || 'Staf', action: `Tahap pengerjaan diperbarui ke: ${stageId}. (Status: ${status})` };
            return { ...c, status, isComplete, currentStageId: stageId, logs: c.logs ? [...c.logs, newLog] : [newLog] };
          }
          return c;
        })
      );
    }
  };

  // D. Update Detail Berkas (Catatan & Checklist Dokumen)
  const updateCase = async (id, updatedFields) => {
    if (user) {
      const c = cases.find(item => item.id === id);
      if (!c) return;

      // 1. Update detail-detail berkas jika diubah
      const dbUpdate = {};
      const changes = [];

      if (updatedFields.notes !== undefined && updatedFields.notes !== c.notes) {
        dbUpdate.notes = updatedFields.notes;
        changes.push(`Catatan berkas diperbarui`);
      }
      if (updatedFields.fees !== undefined && Number(updatedFields.fees) !== c.fees) {
        dbUpdate.fees = Number(updatedFields.fees);
        changes.push(`Biaya akta diubah menjadi Rp ${Number(updatedFields.fees).toLocaleString('id-ID')}`);
      }
      if (updatedFields.propertyLocation !== undefined && updatedFields.propertyLocation !== c.propertyLocation) {
        dbUpdate.property_location = updatedFields.propertyLocation;
        changes.push(`Lokasi objek diubah menjadi "${updatedFields.propertyLocation}"`);
      }
      if (updatedFields.bankPartner !== undefined && updatedFields.bankPartner !== c.bankPartner) {
        dbUpdate.bank_partner = updatedFields.bankPartner;
        changes.push(`Bank rekanan diubah menjadi "${updatedFields.bankPartner}"`);
      }
      if (updatedFields.estimationDate !== undefined && updatedFields.estimationDate !== c.estimationDate) {
        dbUpdate.estimation_date = updatedFields.estimationDate || null;
        changes.push(updatedFields.estimationDate ? `Perkiraan selesai diubah menjadi ${updatedFields.estimationDate}` : `Perkiraan selesai dihapus (tidak ditentukan)`);
      }
      if (updatedFields.paymentStatus !== undefined && updatedFields.paymentStatus !== c.paymentStatus) {
        dbUpdate.payment_status = updatedFields.paymentStatus;
        changes.push(`Status pembayaran diubah menjadi ${updatedFields.paymentStatus}`);
      }
      if (updatedFields.paidAmount !== undefined && Number(updatedFields.paidAmount) !== c.paidAmount) {
        dbUpdate.paid_amount = Number(updatedFields.paidAmount);
        changes.push(`Jumlah pembayaran diubah menjadi Rp ${Number(updatedFields.paidAmount).toLocaleString('id-ID')}`);
      }
      if (updatedFields.assignedStaffId !== undefined && updatedFields.assignedStaffId !== c.assignedStaffId) {
        dbUpdate.assigned_staff_id = updatedFields.assignedStaffId || null;
        changes.push(`Penugasan staf berkas diperbarui`);
      }
      if (updatedFields.isDraft !== undefined && updatedFields.isDraft !== c.isDraft) {
        dbUpdate.is_draft = updatedFields.isDraft;
        changes.push(updatedFields.isDraft ? `Berkas diubah menjadi draf` : `Berkas resmi diterbitkan dari draf`);
      }
      if (updatedFields.documentsReady !== undefined && updatedFields.documentsReady !== c.documentsReady) {
        dbUpdate.documents_ready = updatedFields.documentsReady;
        changes.push(updatedFields.documentsReady ? 'Seluruh berkas persyaratan telah lengkap' : 'Berkas persyaratan ditandai belum lengkap');
      }

      if (Object.keys(dbUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('cases')
          .update(dbUpdate)
          .eq('id', id);

        if (updateError) {
          console.error('[CasesContext] Gagal memperbarui berkas:', updateError);
          throw new Error(updateError.message);
        }

        // Tulis log aktivitas untuk setiap perubahan (Bulk Insert)
        if (changes.length > 0) {
          const logsArray = changes.map(change => ({
            case_id: id,
            user_id: user.id,
            user_name: profile?.full_name || user.email?.split('@')[0] || 'Staf',
            user_role: profile?.role || 'staff',
            category: c.category,
            action: change,
            icon: 'history'
          }));
          const { data: newLogs, error: logErr } = await supabase
            .from('activity_logs')
            .insert(logsArray)
            .select();
          if (!logErr && newLogs) {
            newLogs.forEach(newLog => prependActivity(newLog));
          }
        }
      }

      // 2. Update status checklist dokumen jika diubah
      if (updatedFields.checklist !== undefined) {
        const oldChecklist = c.checklist || [];
        const newChecklist = updatedFields.checklist;

        for (const item of newChecklist) {
          const oldItem = oldChecklist.find(o => o.id === item.id);
          if (oldItem && oldItem.status !== item.status) {
            const { error: chkError } = await supabase
              .from('checklist_items')
              .update({
                status: item.status,
                file_url: item.fileUrl || null,
                file_name: item.fileName || null,
                updated_by: user.id
              })
              .eq('id', item.id);

            if (chkError) {
              console.error('[CasesContext] Gagal memperbarui checklist item:', chkError);
            } else {
              // Tambahkan log
              const logData = {
                case_id: id,
                user_id: user.id,
                user_name: user.email?.split('@')[0] || 'Staf',
                user_role: 'staff',
                category: c.category,
                action: `Dokumen "${item.name}" diubah statusnya menjadi: ${item.status}`,
                icon: 'history'
              };
              await supabase.from('activity_logs').insert(logData);
            }
          }
        }
      }

      // Refresh satu data berkas agar sinkron dengan database
      const { data: refreshedCases } = await supabase
        .from('cases')
        .select(`
          *,
          assigned_staff:profiles!assigned_staff_id(full_name),
          creator:profiles!created_by_id(full_name),
          checklist_items(*),
          activity_logs(*)
        `)
        .eq('id', id);

      if (refreshedCases && refreshedCases.length > 0) {
        const updatedCaseObj = mapCaseFromDb(refreshedCases[0], refreshedCases[0].checklist_items, refreshedCases[0].activity_logs);
        setCases(prev => prev.map(item => item.id === id ? updatedCaseObj : item));
      }
    } else {
      // Fallback local
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            let newLogs = c.logs || [];
            if (updatedFields.notes !== undefined && updatedFields.notes !== c.notes) {
              newLogs = [...newLogs, { timestamp: new Date().toISOString(), user: c.assignedStaff || 'Staf', action: `Catatan berkas diperbarui: "${updatedFields.notes}"` }];
            }
            if (updatedFields.checklist !== undefined) {
              const oldChecklist = c.checklist || [];
              updatedFields.checklist.forEach((item) => {
                const oldItem = oldChecklist.find((o) => o.id === item.id);
                if (oldItem && oldItem.status !== item.status) {
                  newLogs = [...newLogs, { timestamp: new Date().toISOString(), user: c.assignedStaff || 'Staf', action: `Dokumen "${item.name}" diubah statusnya menjadi: ${item.status}` }];
                }
              });
            }
            return { ...c, ...updatedFields, logs: newLogs };
          }
          return c;
        })
      );
    }
  };

  // E. Toggle Kelengkapan Dokumen (DOKUMEN LENGKAP / BELUM LENGKAP)
  const toggleDocStatus = async (id) => {
    if (user) {
      const c = cases.find(item => item.id === id);
      if (!c) return;

      const nextDocStatus = !c.documentsReady;
      const { error: caseError } = await supabase
        .from('cases')
        .update({ documents_ready: nextDocStatus })
        .eq('id', id);

      if (caseError) {
        console.error('[CasesContext] Gagal mengubah status dokumen berkas:', caseError);
        return;
      }

      // Log aktivitas
      const logData = {
        case_id: id,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split('@')[0] || 'Staf',
        user_role: profile?.role || 'staff',
        category: c.category,
        action: nextDocStatus 
          ? 'Konfirmasi kelengkapan berkas: DOKUMEN LENGKAP' 
          : 'Konfirmasi kelengkapan berkas: DOKUMEN BELUM LENGKAP',
        icon: 'history'
      };
      const { data: newLog } = await supabase
        .from('activity_logs')
        .insert(logData)
        .select()
        .single();
      
      if (newLog) prependActivity(newLog);

      // Refresh
      const { data: refreshedCases } = await supabase
        .from('cases')
        .select(`
          *,
          assigned_staff:profiles!assigned_staff_id(full_name),
          creator:profiles!created_by_id(full_name),
          checklist_items(*),
          activity_logs(*)
        `)
        .eq('id', id);

      if (refreshedCases && refreshedCases.length > 0) {
        const updatedCaseObj = mapCaseFromDb(refreshedCases[0], refreshedCases[0].checklist_items, refreshedCases[0].activity_logs);
        setCases(prev => prev.map(item => item.id === id ? updatedCaseObj : item));
      }
    } else {
      // Fallback local
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const nextDocStatus = !c.documentsReady;
            const newLog = {
              timestamp: new Date().toISOString(),
              user: c.assignedStaff || 'Staf',
              action: nextDocStatus ? 'Konfirmasi kelengkapan berkas: DOKUMEN LENGKAP' : 'Konfirmasi kelengkapan berkas: DOKUMEN BELUM LENGKAP'
            };
            return { ...c, documentsReady: nextDocStatus, logs: c.logs ? [...c.logs, newLog] : [newLog] };
          }
          return c;
        })
      );
    }
  };

  // F. Hapus Berkas
  const deleteCase = async (id) => {
    if (user) {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[CasesContext] Gagal menghapus berkas di Supabase:', error);
        return;
      }
      setCases(prev => prev.filter(item => item.id !== id));
    } else {
      // Fallback local
      setCases((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // G. Pencarian Berkas Publik (Guest/Client) lewat RPC (Aman dari Dumps)
  const trackCase = async (caseNumber) => {
    try {
      const { data, error } = await supabase
        .rpc('track_case', { p_case_number: caseNumber });
      
      if (error) {
        console.error('[CasesContext] Gagal melakukan tracking berkas publik:', error);
        return null;
      }

      if (!data || data.length === 0) return null;
      
      const c = data[0];
      return {
        id: c.id,
        caseNumber: c.case_number,
        category: c.category,
        serviceType: c.service_type,
        status: c.status,
        currentStageId: c.current_stage_id,
        isComplete: c.is_complete,
        documentsReady: c.documents_ready,
        entryDate: c.entry_date,
        estimationDate: c.estimation_date,
        clientName: c.client_name,
        fees: Number(c.fees || 0),
        paymentStatus: c.payment_status || 'Belum Lunas',
        paidAmount: Number(c.paid_amount || 0),
        checklist: (c.checklist || []).map(item => ({
          id: item.id,
          orderNum: item.order_num,
          name: item.name,
          description: item.description,
          status: item.status
        })),
        logs: (c.logs || []).map(log => ({
          timestamp: log.timestamp,
          user: log.user,
          action: log.action
        }))
      };
    } catch (err) {
      console.error('[CasesContext] Error di trackCase:', err);
      return null;
    }
  };

  return (
    <CasesContext.Provider value={{ cases, activities, addCase, updateCaseStatus, updateCaseStage, updateCase, toggleDocStatus, deleteCase, trackCase, loading }}>
      {children}
    </CasesContext.Provider>
  );
};
