// ===============================
// DASHBOARD.GS
// FMC BROILER MOBILE V5
// ===============================

function getDashboardInfo() {

  const sh = SpreadsheetApp
      .openById(SPREADSHEET_ID)
          .getSheetByName("DASHBOARD");

            return {

                farm: {

                      namaFarm: sh.getRange("C3").getDisplayValue(),

                            chickIn: sh.getRange("C4").getDisplayValue(),

                                  periode: sh.getRange("C5").getDisplayValue()

                                      },

                                          kpi: {

                                                docIn: sh.getRange("C6").getDisplayValue(),

                                                      ayamHidup: sh.getRange("C7").getDisplayValue(),

                                                            mati: sh.getRange("C8").getDisplayValue(),

                                                                  afkir: sh.getRange("C9").getDisplayValue(),

                                                                        mortalitas: sh.getRange("C10").getDisplayValue(),

                                                                              deplesi: sh.getRange("C11").getDisplayValue(),

                                                                                    fcr: sh.getRange("C12").getDisplayValue(),

                                                                                          ip: sh.getRange("C13").getDisplayValue()

                                                                                              }

                                                                                                };

                                                                                                }


                                                                                                function bersihkanNilai(nilai){

                                                                                                  if (
                                                                                                      nilai == "#DIV/0!" ||
                                                                                                          nilai == "#N/A" ||
                                                                                                              nilai == ""
                                                                                                                ){
                                                                                                                    return "-";
                                                                                                                      }

                                                                                                                        return nilai;

                                                                                                                        }


                                                                                                                        function getFlok(){

                                                                                                                          const sh = SpreadsheetApp
                                                                                                                              .openById(SPREADSHEET_ID)
                                                                                                                                  .getSheetByName("DASHBOARD");

                                                                                                                                    return [

                                                                                                                                        {
                                                                                                                                              nama:"A",
                                                                                                                                                    hidup:bersihkanNilai(sh.getRange("B19").getDisplayValue()),
                                                                                                                                                          mortalitas:bersihkanNilai(sh.getRange("C19").getDisplayValue()),
                                                                                                                                                                bb:bersihkanNilai(sh.getRange("D19").getDisplayValue()),
                                                                                                                                                                      fcr:bersihkanNilai(sh.getRange("E19").getDisplayValue()),
                                                                                                                                                                            ip:bersihkanNilai(sh.getRange("F19").getDisplayValue()),
                                                                                                                                                                                  status:bersihkanNilai(sh.getRange("G19").getDisplayValue())
                                                                                                                                                                                      },

                                                                                                                                                                                          {
                                                                                                                                                                                                nama:"B",
                                                                                                                                                                                                      hidup:bersihkanNilai(sh.getRange("B20").getDisplayValue()),
                                                                                                                                                                                                            mortalitas:bersihkanNilai(sh.getRange("C20").getDisplayValue()),
                                                                                                                                                                                                                  bb:bersihkanNilai(sh.getRange("D20").getDisplayValue()),
                                                                                                                                                                                                                        fcr:bersihkanNilai(sh.getRange("E20").getDisplayValue()),
                                                                                                                                                                                                                              ip:bersihkanNilai(sh.getRange("F20").getDisplayValue()),
                                                                                                                                                                                                                                    status:bersihkanNilai(sh.getRange("G20").getDisplayValue())
                                                                                                                                                                                                                                        },

                                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                                  nama:"C",
                                                                                                                                                                                                                                                        hidup:bersihkanNilai(sh.getRange("B21").getDisplayValue()),
                                                                                                                                                                                                                                                              mortalitas:bersihkanNilai(sh.getRange("C21").getDisplayValue()),
                                                                                                                                                                                                                                                                    bb:bersihkanNilai(sh.getRange("D21").getDisplayValue()),
                                                                                                                                                                                                                                                                          fcr:bersihkanNilai(sh.getRange("E21").getDisplayValue()),
                                                                                                                                                                                                                                                                                ip:bersihkanNilai(sh.getRange("F21").getDisplayValue()),
                                                                                                                                                                                                                                                                                      status:bersihkanNilai(sh.getRange("G21").getDisplayValue())
                                                                                                                                                                                                                                                                                          },

                                                                                                                                                                                                                                                                                              {
                                                                                                                                                                                                                                                                                                    nama:"D",
                                                                                                                                                                                                                                                                                                          hidup:bersihkanNilai(sh.getRange("B22").getDisplayValue()),
                                                                                                                                                                                                                                                                                                                mortalitas:bersihkanNilai(sh.getRange("C22").getDisplayValue()),
                                                                                                                                                                                                                                                                                                                      bb:bersihkanNilai(sh.getRange("D22").getDisplayValue()),
                                                                                                                                                                                                                                                                                                                            fcr:bersihkanNilai(sh.getRange("E22").getDisplayValue()),
                                                                                                                                                                                                                                                                                                                                  ip:bersihkanNilai(sh.getRange("F22").getDisplayValue()),
                                                                                                                                                                                                                                                                                                                                        status:bersihkanNilai(sh.getRange("G22").getDisplayValue())
                                                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                                              ];

                                                                                                                                                                                                                                                                                                                                              }