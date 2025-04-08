import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const paymentToken = searchParams.get("token");
  //   console.log(token);
  const navigate = useNavigate();

  useEffect(() => {
    // document.ready() = function () {
    // SnapToken acquired from previous step
    window.snap.pay(paymentToken, {
      // Optional
      onSuccess: function (result) {
        // console.log(result);
        navigate("/library");
      },
      // Optional
      onPending: function (result) {
        console.log(result);
      },
      // Optional
      onError: function (result) {
        console.log(result);
      },
    });
    // };
  }, []);

  return (
    <div>
      <h1>Payment Page</h1>
      <p>This is the payment page.</p>
    </div>
  );
};
