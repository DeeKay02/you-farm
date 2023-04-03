import BidsDialog from "@/components/BidsDialog";
import { getBidsOfDealer, getDealById, postBid } from "@/utils/deals";
import { Button, Container, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const { default: Link } = require("next/link");

// const product = {
//   title: "Carrots",
//   quantity: "2 kg",
//   close_time: "2 days",
//   owner: "Daniel",
// };

// const rows = [
//   { id: 1, name: "Hello", bid: "$ 200", distance: "2 km", id: 98974592739 },
//   {
//     id: 2,
//     name: "Hello World",
//     bid: "$ 100",
//     distance: "2 km",
//     id: 98974592739,
//   },
//   { id: 3, name: "Donkey", bid: "$ 120", distance: "2 km", id: 98974592739 },
//   { id: 4, name: "Monkey", bid: "$ 250", distance: "2 km", id: 98974592739 },
// ];

// const columns = [
//   { field: "name", headerName: "Name", flex: 0.3 },
//   { field: "amount", headerName: "Bid", flex: 0.1 },
//   { field: "createdon", headerName: "Date", flex: 0.4 },
//   { field: "phone", headerName: "Phonenumber", flex: 0.2 },
// ];
const columns = [
  { field: "id", headerName: "SI.NO", flex: 0.1 },
  { field: "name", headerName: "Name", flex: 0.3 },
  { field: "bid", headerName: "Bid", flex: 0.2 },
  { field: "phone", headerName: "Phone", flex: 0.3 },
  { field: "createdon", headerName: "Date", flex: 0.3 },
];

const Deals = () => {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState({
    name: "Loading...",
    createdby: "Loading...",
    closetime: "Loading...",
    quantity: "Loading...",
  });

  const [bids, setBids] = useState([]);

  const [open, setOpen] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);

  const handleClickOpen = () => {
    if (hasBid)
      toast(`You have already placed a bid of $${bidAmount} for this product`, {
        icon: "🤔",
      });
    else setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    const userData = JSON.parse(window.localStorage.getItem("userdata"));
    const bid = {
      amount: value,
      phone: userData["phone"],
      id: id,
      name: userData["name"],
    };
    postBid(bid)
      .then((res) => {
        if (res.status == 200) {
          setBidAmount(value);
          toast.success(`You have placed a bid of $ ${value}`);
          setHasBid(true);
        } else {
          toast.error(`Error: ${res.status}`);
        }
      })
      .catch((err) => {
        toast.error(`Error: ${err}`);
        console.log(err);
      });
  };

  // Get deal by id (id)
  useEffect(() => {
    const fetchData = async () => {
      const data = await getDealById(id);

      setProduct(data);
      const { bids: res } = data;
      let x = [];
      res.map((item, index) => {
        let dic = {};
        item.createdon = new Date(
          item.createdon.seconds * 1000 + item.createdon.nanoseconds / 1000000
        ).toUTCString();
        // item.id = index + 1;
        // item.amount = `$ ${item.amount}`;
        dic.id = index + 1;
        dic.name = item.name;
        dic.bid = `$ ${item.amount}`;
        dic.phone = item.phone;
        dic.createdon = item.createdon;
        x = [...x, dic];
      });
      console.log(x);
      if (res.length > 0) {
        setBids(x);
      }
    };
    if (id !== undefined) fetchData();
  }, [id]);

  return (
    <>
      <Toaster position="bottom-right" />
      <Container>
        <Stack
          minHeight={"20vh"}
          flexDirection={"column"}
          justifyContent={"space-between"}
          paddingY={"2rem"}
        >
          <Stack>
            <Typography variant="h3" textTransform={"capitalize"}>
              {product.name}
            </Typography>
            <Typography>By {product.createdby}</Typography>
          </Stack>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h5">{product.quantity} kg</Typography>
            <Typography variant="body2">
              Closes at{" "}
              {new Date(
                product.closetime.seconds * 1000 +
                  product.closetime.nanoseconds / 1000000
              ).toDateString()}
            </Typography>
            <div>
              <Button variant="contained" onClick={handleClickOpen}>
                Bid
              </Button>
              <BidsDialog hasBid={hasBid} open={open} onClose={handleClose} />
            </div>
          </Stack>
        </Stack>
        <Stack minHeight={"70vh"}>
          <DataGrid columns={columns} rows={bids} />
        </Stack>
      </Container>
    </>
  );
};
export default Deals;