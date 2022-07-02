//  google api data send to admin api so that we got that data from admin api

import { Service, Container } from "typedi";
import bcrypt from "bcrypt";
import { response, NextFunction, Request } from "express";
import knex from "../data/knex";
import HttpException from "../exceptions/HttpException";
import { User, SendRequest, EditRequest, Post } from "../models/user.dto";
import jwt from "jsonwebtoken";
import config from "../config";
import atob from "atob";
import app_constant, { Tables, Queries } from "../../app-constant";
import crypto from "crypto";
import moment from "moment";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { LoginService } from './login-service';
import getAdminRealtimeData from './google-apis'
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

@Service()
export class AdminService {
  logger:any;
 
  constructor(){ 
    this.logger = Container.get('logger');
  
  }

/**
*
*Method Used to get admin dashboard details
*
*/
public  getAdminDashboard = async (authData:any):Promise<any> => {   
  const totalUsersCount =  await knex(Tables.USERS).count('*');  
  const totalSubscribersCount =  await knex(Tables.USERS).count('*').where({subscriber:true}); 
  const totalAdminCount =  await knex(Tables.USERS).count('*').where({is_admin:true}); 
  const gaData = await getAdminRealtimeData();
  try {
    if(totalUsersCount.length > 0 && totalSubscribersCount.length > 0 && totalAdminCount.length > 0){
      return {
        success: true,
        status: 500,  
        data:{
          total_users_count : totalUsersCount[0].count,
          total_subscribers_count : totalSubscribersCount[0].count,
          total_admin_count : totalAdminCount[0].count,
          google_analytics: gaData
        },  
        message: "Admin dashboard details fetched successfully.",
      }; 
  }
  } catch(e){

    throw new HttpException(e.status,e.success,e.message);
  }

  
}

public sendEmail = async (authData:any, inputData:any):Promise<any> => {   

  try {
    let totalUsers: any = [], totalSubscribedUsers: any = [], totalUnsubscribedUsers: any = [];
    if (inputData.all_users) {
      totalUsers =  await knex(Tables.USERS).select(['username']).where({blocked: false}); 
    }

    if (inputData.subscribed_users) {
      totalSubscribedUsers =  await knex(Tables.USERS).select(['username']).where({subscriber:true, blocked: false}); 
    }

    if (inputData.unsubscribed_users) {
      totalUnsubscribedUsers =  await knex(Tables.USERS).select(['username']).where({blocked: false}).orWhere({subscriber:false}).orWhere({subscriber:null}); 
    }
    
    const mergeAllUsersList = [...totalUsers, ...totalSubscribedUsers, ...totalUnsubscribedUsers];

    let convertAllUsersListInArr: any = []; 
    mergeAllUsersList.map (function (item) {
      convertAllUsersListInArr.push (item.username) 
    })
    // const uniqueEmails = new Set(convertAllUsersListInArr);
    const uniqueEmails = Array.from(new Set(convertAllUsersListInArr));
    const msg = {
      to: uniqueEmails,
      from: "support@fullbridge.com", // Use the email address or domain you verified above
      subject: inputData.subject,
      text: inputData.text,
      html: inputData.html,
    };
    
    sgMail
      .send(msg)
      .then((responseData:any) => {
        console.log("responseData: ", responseData);

        return {
          success: true,
          status: 201,  
          data:responseData,  
          message: "Email sent successfully.",
        }; 
      }, (error:any) => {
        console.error(error);
    
        if (error.response) {
          console.error(error.response.body)
        }

        return {
          success: true,
          status: 400,  
          data: error,  
          message: "Error in sending email.",
        }; 
      });
    
  } catch(e){

    throw new HttpException(e.status,e.success,e.message);
  }

  
}

}