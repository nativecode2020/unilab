const visitHash = "17054990182692269";
const gerToken = () => {
  return localStorage.getItem("token");
};
const setVisitHash = (hash) => {
  visitHash = hash; // set visit hash
};

const createWaitElement = (message) => {
  let element = `
    <div id="alert_screen" class="alert_screen"> 
        <div class="loader">
            <div class="loader-content">
                <div class="card" style="width: 40rem;">
                    <div class="card-body text-center">
                    <h1 class="card-title">الرجاء الانتظار </h1>
                    <h4>${message}</h4>
                    <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="100" height="100" alt="alert_screen">
                    <div class="w-100 mt-5"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  let body = document.querySelector("body");
  body.insertAdjacentHTML("beforeend", element);
};

const removeWaitElment = () => {
  let element = document.getElementById("alert_screen");
  element.remove();
};

class Result {
  constructor() {}
  normalResultHeader() {
    return `<div class="testhead row sections m-0 mt-2 category_category">
      <div class="col-3">
        <p class="text-right">Test Name</p>
      </div>
      <div class="col-3 justify-content-between">
        <p class="text-center w-100">Result</p>
      </div>
      <div class="col-1 justify-content-between">
        <p class="text-center w-100">Flag</p>
      </div>
      <div class="col-2">
        <p class="text-right">Unit</p>
      </div>
      <div class="col-3">
        <p class="text-right">Normal Range</p>
      </div>
    </div>`;
  }

  normalResultRow(test) {
    console.log(test);
    let { name, category, result, unit, range } = test;
    category = category?.split(" ")?.join("_");
    let ranges = range.map((r) => {
      return `<p class="text-right w-100" style="color: rgb(0, 0, 0);">${r.name}: ${r.low}</p>`;
    });
    return `
      <div
        data-flag="flag"
        class="test row m-0 category_${category} border-test"
        id="test_normal"
        data-cat="${category}"
        style="display: ${
          result.checked ? "flex" : "none"
        }; border: 0px solid rgb(0, 0, 0); padding: 0px; margin: 0px;"
      >
        <div class="testname col-3">
          <p class="text-right w-100" style="color: rgb(0, 0, 0);">
            ${name}
          </p>
        </div>
        <div class="testresult col-2">
          <p class="w-100 text-center  text-dark" style="color: rgb(0, 0, 0);">
            ${result[name] ?? ""}
          </p>
        </div>
        <div class="testresult col-2">
          <p
            class="w-75 text-center text-dark"
            style="color: rgb(0, 0, 0);"
          ></p>
        </div>
        <div class="testresult col-2">
          <p style="color: rgb(0, 0, 0);"> ${unit}</p>
        </div>
        <div class="testnormal col-3">
          <p class="text-right w-100" style="color: rgb(0, 0, 0);">
            Nonreactive:&lt;= 10
          </p>
          <p class="text-right w-100" style="color: rgb(0, 0, 0);">
            Reactive: 10 &lt;=
          </p>
        </div>
        <div class="testprice col-12 h5 text-right text-info"></div>
      </div>
    `;
  }
}

const fetchData = async (visitHash) => {
  let root = document.getElementById("root");
  const token = gerToken();
  const form = new FormData();
  form.append("visitHash", visitHash);
  await fetch(`${base_url}Visit/getVisitTests`, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let header = drawInvoiceHeader(data);
      root.insertAdjacentHTML("afterbegin", header);

      let nav = drawInvoiceNav(data);
      root.insertAdjacentHTML("beforeend", nav);

      let result = new Result();
      let normalResultHeader = result.normalResultHeader();
      root.insertAdjacentHTML("beforeend", normalResultHeader);

      let {
        tests: { normal },
      } = data;

      let rows = "";
      normal.forEach((test) => {
        rows += result.normalResultRow(test);
      });
      root.insertAdjacentHTML("beforeend", rows);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

fetchData(visitHash);

const drawInvoiceHeader = ({ invoice }) => {
  let { workers, logo, size, name_in_invoice } = invoice;
  let html = "";
  if (workers.length > 0) {
    html = workers
      .map((worker) => {
        if (worker.hash == "logo") {
          return `
        <div class="logo col-${size}  p-2">
        <img src="${logo}" alt="" />
      </div>
      `;
        }
        return `
      <div class="right col-md-${size}">
        <div class="size1">
          <p class="title">${worker.jop ?? "Jop title"}</p>
          <p class="namet">${worker.name ?? "Worker name"}</p>
          <p class="certificate">${worker.jop_en ?? "Jop En title"}</p>
        </div>
      </div>
      `;
      })
      .join("");
  } else {
    html = `
      <div class="logo col-4 p-2">
          <img src="${logo ?? ""}" 
          alt="${logo ?? "upload Logo"}">
      </div>
      <div class="logo justify-content-end col-4 p-2">
          <h2 class="navbar-brand-name text-center">${
            name_in_invoice ?? localStorage.lab_name ?? ""
          }</h2>
      </div>`;
  }
  return `
    <div class="header">
        <div class="row justify-content-between">
            ${html}
        </div>
    </div>`;
};

const drawInvoiceNav = ({ invoice, patient }) => {
  const { doing_by } = invoice;
  let { age, date, gender, name, visit_hash } = patient;
  age =
    parseFloat(age) < 1
      ? parseInt(age * 356) + " Day"
      : parseInt(age) + " Year";
  gender = gender == "ذكر" ? "Male" : "Female";
  let type =
    age > 16
      ? gender == "ذكر"
        ? "السيد"
        : "السيدة"
      : gender == "ذكر"
      ? "الطفل"
      : "الطفلة";
  let html = `
    <div class="nav">
      <div class="name">
        <p class="">Name</p>
      </div>
      <div class="namego">
        <p>${type} / ${name}</p>
      </div>
      <div class="paid">
        <p class="">Barcode</p>
      </div>
      <div class="paidgo d-flex justify-content-center align-items-center"></div>
      <div class="agesex">
        <p class="">Sex / Age</p>
      </div>
      <div class="agesexgo">
        <p>
          <span class="note">${gender}</span> / <span class="note">${age}</span>
        </p>
      </div>
      <div class="vid">
        <p class="">Date</p>
      </div>
      <div class="vidgo">
        <p>
          <span class="note">${date}</span>
        </p>
      </div>
      <div class="refby">
        <p class="">By</p>
      </div>
      <div class="refbygo">
        <p>${doing_by}</p>
      </div>
      <div class="prd">
        <p class="">Doctor</p>
      </div>
      <div class="prdgo">
        <p>
          <span class="note">مريض خارجي</span>
        </p>
      </div>
    </div>
  `;
  return html;
};
