const labHash = localStorage.getItem("lab_hash");

const initInvoiceItem = {
  name: "",
  unit: "",
  result: "",
  range: [],
  flag: "",
};

const InvoiceItemReducer = (state, action) => {
  switch (action.type) {
    case "NAMEANDUNIT":
      return { ...state, name: action.payload.name, unit: action.payload.unit };
    case "RESULT":
      if (action.payload)
        return { ...state, result: action.payload[state.name] };
      else return { ...state, result: "" };
    case "RANGE":
      return { ...state, range: action.payload };
    case "FLAG":
      return { ...state, flag: action.payload };
    default:
      return state;
  }
};

const Invoice = ({ tests, setTests }) => {
  const [invoice, setInvoice] = React.useState({});
  const [center, setCenter] = React.useState(0);
  const testerRef = React.useRef(null);

  const fetchInvoice = () => {
    let data = run(`select * from lab_invoice where lab_hash = '${labHash}';`)
      .result[0].query0[0];
    if (data.center) {
      setCenter(data.center);
    }
    return data;
  };

  React.useEffect(() => {
    console.log(testerRef);
  }, [testerRef]);

  React.useEffect(() => {
    let data = fetchInvoice();
    if (data) {
      setInvoice(data);
    } else {
      run({
        action: "insert",
        table: "lab_invoice",
        column: {
          lab_hash: labHash,
          color: "#6F8EFC",
          font_color: "#000000",
          phone_1: "",
          phone_2: "",
          address: "",
          facebook: "",
          water_mark: "",
          logo: "",
          name_in_invoice: localStorage.getItem("lab_name") || "",
        },
      });

      setInvoice(fetchInvoice());
    }
  }, []);

  React.useEffect(() => {
    console.log(center);
  }, [tests]);

  const handelCenter = (i) => {
    setCenter(i);
  };

  return (
    <div className="book-result" dir="ltr" id="invoice-normalTests" style={{}}>
      <div className="page">
        <div
          className="header"
          style={{ height: invoice.header }} // height: ${header}px;
        >
          <div
            className="row justify-content-around"
            // style={{ display:  }}
          >
            <div className="logo col-4 p-2">
              <img src={invoice.logo} alt="logo" />
            </div>
            <div className="logo justify-content-end col-4 p-2">
              <h2 className="navbar-brand-name text-center">
                {invoice.name_in_invoice}
              </h2>
            </div>
          </div>
        </div>

        <div
          className="center2"
          style={{
            borderTop: "5px solid rgb(46, 63, 76)",
            height: invoice.center,
          }} // height: ${center}px;
        >
          <div
            className="center2-background"
            style={{
              backgroundImage: `url(&quot;${invoice.logo}&quot;)`,
              display: "none",
            }} // style="background-image: url(&quot;${logo}&quot;); display: none;"
          ></div>
          <div className="nav">
            <div className="name">
              <p className="">Name</p>
            </div>
            <div className="namego">
              <p>السيد / اسم المريض</p>
            </div>
            <div className="paid">
              <p className="">Barcode</p>
            </div>
            <div className="paidgo d-flex justify-content-center align-items-center"></div>
            <div className="agesex">
              <p className="">Sex / Age</p>
            </div>
            <div className="agesexgo">
              <p>
                <span className="note">Male</span> /{" "}
                <span className="note">100 Year</span>
              </p>
            </div>
            <div className="vid">
              <p className="">Date</p>
            </div>
            <div className="vidgo">
              <p>
                <span className="note">2023-01-01</span>
              </p>
            </div>
            <div className="refby">
              <p className="">By</p>
            </div>
            <div className="refbygo">
              <p>المختبر</p>
            </div>
            <div className="prd">
              <p className="">Doctor</p>
            </div>
            <div className="prdgo">
              <p>
                <span className="note">مريض خارجي</span>
              </p>
            </div>
          </div>

          <div className="tester" ref={testerRef}>
            <div className="testhead row sections m-0 mt-2 category_category">
              <div className="col-3">
                <p className="text-right">Test Name</p>
              </div>
              <div className="col-2 justify-content-between">
                <p className="text-center w-75">Result</p>
              </div>
              <div className="col-2 justify-content-between">
                <p className="text-center w-75">Flag</p>
              </div>
              <div className="col-2">
                <p className="text-right">Unit</p>
              </div>
              <div className="col-3">
                <p className="text-right">Normal Range</p>
              </div>
            </div>
            <div className="test typetest pt-3 category_Tests">
              <p>Tests</p>
            </div>
            {tests.map((test, index) => {
              return <InvoiceItem test={test} key={test.hash} />;
              // return "";
            })}
          </div>
        </div>

        <div
          className="footer2"
          style={{
            borderTop: " 5px solid rgb(46, 63, 76)",
            height: invoice.footer,
          }}
        >
          <div
            className="f1"
            style={{ display: invoice.footer_header_show == "1" ? "" : "none" }} // "display: ${footer_header_show == '1' ? '' : 'none'};"
          >
            {invoice.address && (
              <p>
                <i className="fas fa-map-marker-alt"></i>
                {invoice.address}
              </p>
            )}
          </div>
          <div
            className="f2"
            style={{ display: invoice.footer_header_show == "1" ? "" : "none" }} // "display: ${footer_header_show == '1' ? '' : 'none'};"
          >
            <p>
              {invoice.facebook && (
                <span className="note">
                  <i className="fas fa-envelope"></i> {invoice.facebook}|
                </span>
              )}
              {invoice.phone_1 && (
                <span className="note">
                  <i className="fas fa-phone"></i> {invoice.phone_1}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceItem = ({ test }) => {
  const [state, dispatch] = React.useReducer(
    InvoiceItemReducer,
    initInvoiceItem
  );

  React.useEffect(() => {
    console.log(document.querySelector(".tester").offsetHeight);
    const {
      hash,
      name,
      unit_name,
      options,
      result_test,
      unit,
      kit_id,
      category,
    } = test;
    dispatch({ type: "NAMEANDUNIT", payload: { name, unit: unit_name } });
    let result = JSON.parse(result_test);
    dispatch({ type: "RESULT", payload: result });
    let component = JSON.parse(options);
    if (component) {
      let { reference } = component.component[0];
      reference = reference.filter((ref, index) => {
        return index == 0; // (ref.unit == unit && ref.kit == kit_id);
      });
      if (reference.length > 0) {
        let { range } = reference[0];
        dispatch({ type: "RANGE", payload: range });
        let correctRange = range.filter((r) => {
          return r.correct;
        });
        if (correctRange.length > 0) {
          let { low, high } = correctRange[0];
          // check if result is in range
          if (state.result < low) {
            dispatch({ type: "FLAG", payload: "L" });
          }
          if (state.result > high) {
            dispatch({ type: "FLAG", payload: "H" });
          }
        }
      }
    }
  }, []);

  return (
    <div
      data-flag="flag"
      className="test row m-0 category_Tests border-test"
      id={`test_normal`}
      data-cat="Tests"
      style={{ display: "flex" }}
    >
      <div className="testname col-3">
        <p className="text-right w-100">{state.name}</p>
      </div>
      <div className="testresult col-2">
        <p
          className={`w-100 text-center ${
            state.flag ? "p-1 border border-dark" : ""
          } ${
            state.flag == "L"
              ? "text-info"
              : state.flag == "H"
              ? "text-danger"
              : "text-dark"
          }`}
        >
          {state.result}
        </p>
      </div>
      <div className="testresult col-2">
        <p
          className={`w-75 text-center ${
            state.flag == "L"
              ? "text-info"
              : state.flag == "H"
              ? "text-danger"
              : "text-dark"
          }`}
        >
          {state.flag}
        </p>
      </div>
      <div className="testresult col-2">
        <p> {state.unit}</p>
      </div>
      <div className="testnormal col-3">
        {state.range.map((r, index) => {
          const { name, low, high } = r;
          if (low && high) {
            return (
              <p className="text-right w-100" key={index}>
                {name && `${name}:`}
                {low} - {high}
              </p>
            );
          } else if (low) {
            return (
              <p className="text-right w-100" key={index}>
                {name && `${name}:`} {low} &lt;=
              </p>
            );
          } else if (high) {
            return (
              <p className="text-right w-100" key={index}>
                {name && `${name}:`}&lt;= {high}
              </p>
            );
          }
        })}
      </div>
      <div className="testprice col-12 h5 text-right text-info"></div>
    </div>
  );
};

const Setting = () => {
  return <h1>Setting</h1>;
};

const InvoiceSetting = () => {
  const invoiceRef = React.useRef(null);
  const [tests, setTests] = React.useState([]);
  const fetchTests = () => {
    return run(`select 
                  option_test as options,
                  test_name as name,
                  kit_id,
                  (select name from devices where devices.id=lab_device_id) as device_name,
                  (select name from kits where kits.id =kit_id) as kit_name,
                  (select name from lab_test_units where hash=lab_pakage_tests.unit) as unit_name,
                  (select name from lab_test_catigory where hash=lab_test.category_hash) as category,
                  unit,
                  result_test,
                  lab_visits_tests.hash as hash
              from 
                  lab_visits_tests 
              left join
                  lab_pakage_tests
              on 
                  lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id
              inner join
                  lab_test
              on
                  lab_test.hash = lab_visits_tests.tests_id
              where 
                  visit_id = '16921880982072694'
              order by sort;`).result[0].query0;
  };

  React.useEffect(() => {
    setTests(fetchTests());
  }, []);

  React.useEffect(() => {
    if (tests.length > 0) {
      ReactDOM.render(
        <Invoice tests={tests} setTests={setTests} />,
        invoiceRef.current
      );
    }
  }, [tests]);
  return (
    <div
      className="row invoice layout-spacing justify-content-center"
      dir="rtl"
    >
      <div className="col-6">
        <Setting />
      </div>
      <div className="col-6" ref={invoiceRef}></div>
    </div>
  );
};

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<InvoiceSetting />);
