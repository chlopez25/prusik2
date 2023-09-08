import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { ethers } from 'ethers';
import { getTiendaContract } from './constracts/tienda.contract';
import { getCTokenContract } from './constracts/ctoken.contract';
import { getMessengerContract } from './constracts/messenger.contract'; //COMENTAR ESTA LINEA 
dotenv.config();



const app: Express = express();
const port = process.env.PORT;

app.options('*', cors({origin: "*"}));

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});


app.get('/hello', async (req, res) => {
  res.json({
    message: "Hello"
  });
});
/*
app.get('/purchaseProduct', async (req: Request, res: Response) => {
  console.log("paso 1")
  const productId = req.query.productId;
  console.log("productId: "+productId)
  const quantity = req.query.quantity;
  console.log("quantity: "+quantity)
  const tiendaContract = getTiendaContract();

  try {
    const tx = await tiendaContract.purchaseProduct(productId, quantity);
    await tx.wait();
    res.json({ success: true, message: "Compra exitosa" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error en la compra" });
  }
});
*/



app.post('/setProductAvailability', async (req, res) => {
  const productId = parseInt(req.body.productId);
  const available = req.body.available;

  const tiendaContract = getTiendaContract();

  try {
    const tx = await tiendaContract.setProductAvailability(productId, available);
    await tx.wait();
    res.json({ success: true, message: "Disponibilidad actualizada" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error al actualizar disponibilidad" });
  }
});

/*app.get('/getProducts', async (req, res) => {
  const tiendaContract = getTiendaContract();
  console.log("paso 1")
  try {
    const products = await tiendaContract.getProducts();
    console.log("paso 2", products)
    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error al obtener la lista de productos" });
  }
});
*/



app.get('/messenger', async (req: Request, res: Response) => {
  const contract = getMessengerContract();
  const response = await contract.getMessage();
  res.json({
    message: response
  });
});

app.put('/messenger', async (req: Request, res: Response) => {
  const message = req.query.message;
  const contract = getMessengerContract();
  const response = await contract.setMessage(message);
  res.json({
    message: response
  });
});

app.get('/ctoken/totalSupply', async (req: Request, res: Response) => {
  const contract = getCTokenContract();
  const response = await contract.totalSupply();
  
  res.json({
    totalSupply: ethers.formatEther(response)
  });
});


app.get('/ctoken/balanceOf', async (req: Request, res: Response) => {
  const contract = getCTokenContract();
  const balanceOf = await contract.balanceOf(req.query.address);
    
  res.json({
    balanceOf: ethers.formatEther(balanceOf)
  });
});

app.get('/ctoken/transfer', async (req: Request, res: Response) => {
  const {address, amount} = req.query 

  const contract = getCTokenContract();
  const result = await contract.transfer(address, ethers.parseUnits(amount as string, 18));

  res.json({
    transfer: result
  });
});

app.get('/purchaseProduct', async (req: Request, res: Response) => {
  const {productId, quantity} = req.query 
  //const contract = getCTokenContract();
  //const result = await contract.transfer(address, ethers.parseUnits(amount as string, 18));
 

  console.log("paso 1")
 // const productId = parseInt(req.query.productId);
  console.log("productId: "+productId)
  //const quantity = req.query.quantity;
  console.log("quantity: "+quantity)
  const tiendaContract = getTiendaContract();
  console.log("paso 2")

  try {
    const tx = await tiendaContract.purchaseProduct(productId, quantity);
    await tx.wait();
    res.json({ success: true, message: "Compra exitosa" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error en la Compra" });
  }

});

app.get('/getProducts', async (req, res) => {
  try {
    const tiendaContract = getTiendaContract();
    console.log("paso 1");
    
    // Obtener la lista de productos desde el contrato Tienda
    const products = await tiendaContract.getProducts();
    console.log("paso 2", products);

    // Convertir los BigInt a string de manera explícita
    const serializedProducts = products.map((product: any) => ({
      id: product[0].toString(),
      name: product[1],
      description: product[2],
      stock: product[3].toString(),
      available: product[4]
    }));

    // Crear la respuesta HTML
    let html = '<html><head><title>Tienda</title></head><body>';
    html += '<h1>Lista de Productos</h1>';
    html += '<ul>';
    serializedProducts.forEach((product: any) => {
      html += `<li>${product.name} - ${product.description} - Stock: ${product.stock} - Disponible: ${product.available}</li>`;
    });
    html += '</ul>';
    html += '</body></html>';

    // Responder con JSON y HTML en una sola respuesta
    res.json({ success: true, products: serializedProducts, html });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error al obtener la lista de productos" });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: DApp API Server is running at http://localhost:${port}`);
});
