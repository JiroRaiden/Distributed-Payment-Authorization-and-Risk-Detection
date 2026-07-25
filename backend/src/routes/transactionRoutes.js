import express from "express";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { evaluateTransactionRisk } from "../services/decisionEngine.js";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

const router = express.Router();

function sendError(res,statusCode, message){
	return res.status(statusCode).json({
		success: false,
		error: {
			message,
		}
	});
}

router.post("/", async (req, res)=>{
	const transaction = req.body;
	
	const requiredFields = ["userId",
				"amount",
				"timestamp",
				"location",
				"deviceId",
				"merchantName"
				];

	const missingField = requiredFields.find((field)=> !transaction[field]);

	if(missingField){
	return sendError(res,400, `${missingField} is required`);
}


if(typeof transaction.userId!== "string" || transaction.userId.trim()===""){
	return sendError(res, 400, "userId must be a non-empty string");
}	
	
	if(typeof transaction.amount!=="number" || transaction.amount<=0){
	return sendError(res, 400, "The entered amount should be a number greater than 0");
}
	const parsedTimestamp = new Date(transaction.timestamp);
	if(Number.isNaN(parsedTimestamp.getTime())){
		return sendError(res, 400, "timestamp must be a valid date");
	}

	if(typeof transaction.location!== "string" || transaction.location.trim()===""){
		return sendError(res, 400, "location must be a non-empty string");
	}

	if(typeof transaction.deviceId!== "string" || transaction.deviceId.trim()===""){
		return sendError(res, 400, "deviceId must be a non-empty string");
	}

	if(typeof transaction.merchantName!== "string" || transaction.merchantName.trim()===""){
	return sendError(res, 400, "merchantName must be a non-empty string");
}

try{
	const savedTransaction = await prisma.transaction.create({
		data: {
			userId: transaction.userId,
			amount: transaction.amount,
			timestamp: parsedTimestamp,
			location: transaction.location,
			deviceId: transaction.deviceId,
			merchantName: transaction.merchantName,
		},
	});

	const fraudReview = evaluateTransactionRisk(savedTransaction);

	return res.status(201).json({
		success:true,
		message:"Transaction received",
		data: {
		transaction: savedTransaction,
		fraudReview,		
			},
		meta: {
		
			receivedAt: new Date().toISOString(),
		},
	});

}
catch(error){
	
	console.error(error);

	return sendError(res, 500, "Failed to save transaction");
}

});

router.get("/", async (req,res) =>{
	try {
		const transactions = await prisma.transaction.findMany({
			orderBy: {
				createdAt: "desc",
			},
			take:50,
		});

		return res.json({
			success:true,
			data:{
				transactions,
			},
		});
	} catch (error) {
		console.error(error);

		return sendError(res, 500, "Failed to fetch transactions");
	}
});

router.get("/:id", async (req,res)=> {
	try {
		const transaction = await prisma.transaction.findUnique({
			where: {
				id: req.params.id,
			}
		});

		if(!transaction) {
			return sendError(res, 404, "Transaction not found");
		}
		return res.json({
			success: true,
			data: {
				transaction,
			},
		});

	}catch(error){
		console.error(error);

		return sendError(res, 500, "Failed to fetch transaction");
	}
});

export default router;

