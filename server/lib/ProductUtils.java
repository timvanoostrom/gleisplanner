// 
// Decompiled by Procyon v0.5.36
// 

package org.bidib.jbidibc.core.utils;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

public class ProductUtils
{
    private static final Logger LOGGER;
    
    public static boolean isOneOC(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneOC for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 204L;
    }
    
    public static boolean isOneDMX(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneDMX for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return (vid == 13L && pid == 115L) || (vid == 251L && pid == 112L);
    }
    
    public static boolean isOneServoTurn(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneServoTurn for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 121L;
    }
    
    public static boolean isSTu(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a STu for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 123L;
    }
    
    public static boolean isOneDriveTurn(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneServoTurn for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && (pid == 122L || pid == 143L || pid == 144L || pid == 145L);
    }
    
    public static boolean isOneControl(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneControl for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && (pid == 117L || pid == 140L || pid == 141L || pid == 142L);
    }
    
    public static boolean isOneHub(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneHub for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 114L;
    }
    
    public static boolean isOneBootloader(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a OneBootloader for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 112L;
    }
    
    public static boolean isLightControl(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a LightControl for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 107L;
    }
    
    public static boolean isMobaList(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a MobaList for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 108L;
    }
    
    public static boolean isWs2812(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a Ws2812 for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 159L;
    }
    
    public static boolean isStepControl(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a StepControl for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return (vid == 13L && pid == 120L) || (vid == 251L && (pid == 202L || pid == 201L));
    }
    
    public static boolean isNeoControl(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a NeoControl for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && (pid == 205L || pid == 206L);
    }
    
    public static boolean isNeoEWS(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a NeoEWS for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 129L;
    }
    
    public static boolean isRFBasisNode(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a RFBasisNode for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return (vid == 13L && pid == 32770L) || (vid == 251L && pid == 302L);
    }
    
    public static boolean isRFBasisV2Node(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a RFBasisNodeV2 for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 251L && pid == 302L;
    }
    
    public static boolean isSpeedometer(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a Speedometer for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 32780L;
    }
    
    public static boolean isMultiDecoder(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a MultiDecoder for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 62L && pid == 151L;
    }
    
    public static boolean isReadyBoost(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a ReadyBoost for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 251L && pid == 117L;
    }
    
    public static boolean isReadyBoostProg(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a ReadyBoostProg for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 251L && pid == 118L;
    }
    
    public static boolean isIF2(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a IF2 for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 132L;
    }
    
    public static boolean isGBM16TS(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a GBM16TS for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 134L;
    }
    
    public static boolean isGBMBoostMaster(final long uniqueId) {
        final long pid = NodeUtils.getPid(uniqueId);
        final long vid = NodeUtils.getVendorId(uniqueId);
        ProductUtils.LOGGER.debug("Check if node is a GBMBoostMaster for uniqueId: {}, pid: {}, vid: {}", new Object[] { NodeUtils.getUniqueIdAsString(uniqueId), pid, vid });
        return vid == 13L && pid == 104L;
    }
    
    static {
        LOGGER = LoggerFactory.getLogger((Class)ProductUtils.class);
    }
}
