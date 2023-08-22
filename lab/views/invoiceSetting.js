const labHash = localStorage.getItem("lab_hash");

const Invoice = () => {
  const [invoice, setInvoice] = React.useState({});

  const fetchInvoice = () => {
    return run(`select * from lab_invoice where lab_hash = '${labHash}';`)
      .result[0].query0[0];
  };

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
    console.log(invoice);
  }, [invoice]);
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

          <div className="tester">
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
            <InvoiceItem test={{ id: 1 }} />
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

const InvoiceItem = ({ test, type }) => {
  return (
    <div
      data-flag="flag"
      className="test row m-0 category_Tests border-test"
      id={`test_normal_${test.id}`}
      data-cat="Tests"
      style={{ display: "flex" }}
    >
      <div className="testname col-3">
        <p className="text-right w-100">Test Example</p>
      </div>
      <div className="testresult col-2">
        <p className="text-dark w-75 text-center"></p>
      </div>
      <div className="testresult col-2">
        <p className="text-dark w-75 text-center"></p>
      </div>
      <div className="testresult col-2">
        <p> Unit</p>
      </div>
      <div className="testnormal col-3">
        <p className="text-right">&gt;= 5</p>
      </div>
      <div className="testprice col-12 h5 text-right text-info"></div>
    </div>
  );
};

const Setting = () => {
  return <h1>Setting</h1>;
};

const InvoiceSetting = () => {
  return (
    <div
      className="row invoice layout-spacing justify-content-center"
      dir="rtl"
    >
      <div className="col-1">
        <Setting />
      </div>
      <div className="col-11">
        <Invoice />
      </div>
    </div>
  );
};

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<InvoiceSetting />);
