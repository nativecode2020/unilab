"use strict";

// Elmemnts
// tests container
const testsElement = document.getElementById("tests");
// start date
const startDateElement = document.getElementById("startDate");
// end date
const endDateElement = document.getElementById("endDate");
// selected tests
const selectedTestsElement = document.getElementById("test_searsh");
// doctor
const doctorElement = document.getElementById("docotor");
// search button
const searchButtonElement = document.getElementById("searchQ");

$(startDateElement).val(new Date().toISOString().slice(0, 10));
$(endDateElement).val(new Date().toISOString().slice(0, 10));

const test = (test) => {
  return `<div class="card">
    <div class="card-body">
      <h5 class="card-title">${test.name}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${test.price}</h6>
      <p class="card-text">${test.cost}</p>
    </div>
  </div>`;
};

const getTests = async () => {
  const startDate = startDateElement.value;
  const endDate = endDateElement.value;
  const selectedTests = selectedTestsElement.value;
  console.log("selectedTests", selectedTests);
  const doctor = doctorElement.value;

  const formData = new FormData();
  formData.append("startDate", startDate);
  formData.append("endDate", endDate);
  formData.append("selectedTests", selectedTests);
  formData.append("doctor", doctor);

  const response = await fetch(`${base_url}Tests/getVistsByTests`, {
    method: "POST",
    body: formData,
    // token
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  console.log("response", response);
};

$(function () {
  let data = run(`
        SELECT test_id,(select name from lab_package where package_id=lab_package.hash) as name FROM lab_pakage_tests
        where lab_pakage_tests.lab_id = ${localStorage.getItem("lab_hash")}
        group by name ;
        SELECT name,hash FROM lab_doctor where lab_id = ${localStorage.getItem(
          "lab_hash"
        )} and isdeleted =0;
    `).result;
  let tests = data[0].query0;
  let doctors = data[1].query1;
  $(doctorElement).append(`<option value="">كل الاطباء</option>`);
  doctors.forEach((doctor) => {
    $(doctorElement).append(
      `<option value="${doctor.hash}">${doctor.name}</option>`
    );
  });
  tests.forEach((test) => {
    $(selectedTestsElement).append(
      `<option value="${test.test_id}">${test.name}</option>`
    );
  });
  $(selectedTestsElement).select2({
    dropdownParent: $(selectedTestsElement).parent(),
    width: "100%",
  });
  $(doctorElement).select2({
    dropdownParent: $(doctorElement).parent(),
    width: "100%",
  });
});
