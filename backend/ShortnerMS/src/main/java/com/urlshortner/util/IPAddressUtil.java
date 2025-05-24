//package com.urlshortner.util;
//
//import java.net.InetAddress;
//import java.net.NetworkInterface;
//import java.net.SocketException;
//import java.net.UnknownHostException;
//import java.util.Enumeration;
//
//public class IPAddressUtil {
//
////	public static String getLocalIPv4Address() {
////        try {
////            InetAddress inetAddress = InetAddress.getLocalHost();
////            return inetAddress.getHostAddress();
////        } catch (UnknownHostException e) {
////            e.printStackTrace();
////            return "Unable to get IPv4 address";
////        }
////    }
//
//	public static String getLocalIPv4Address() {
//        try {
//            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
//            while (interfaces.hasMoreElements()) {
//                NetworkInterface networkInterface = interfaces.nextElement();
//                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
//
//                while (addresses.hasMoreElements()) {
//                    InetAddress address = addresses.nextElement();
//
//                    // Exclude loop-back and IPv6 addresses
//                    if (!address.isLoopbackAddress() && address instanceof java.net.Inet4Address) {
//                        return address.getHostAddress();
//                    }
//                }
//            }
//        } catch (SocketException e) {
//            e.printStackTrace();
//        }
//        return "Unable to get IPv4 address";
//    }
//
//}
