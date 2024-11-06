import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { Searchbar, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import StaticList from './StaticList';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyApBWUABXIusWxrlvdBt9ttvTd0uSISTQY',
  projectId: 'device-management-43211',
  storageBucket: 'device-management-43211.appspot.com',
  appId: 'com.device_management',
};


const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const BLUE_COLOR = '#0000CD';
const BLACK_COLOR = '#000000';

const formatSpecifications = (specs) => {
  if (!specs || typeof specs !== 'object') return 'N/A';
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' \n');
};

const Statistic = () => {
  const navigation = useNavigation();
  const [roomCountsUser, setRoomCountsUser] = useState({});
  const [roomCountsDevice, setRoomCountsDevice] = useState({});
  const [userCount, setUserCount] = useState({});
  const [errorCount, setErrorCount] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState({
    roomCountsUser: {},
    roomCountsDevice: {},
    userCount: {},
    errorCount: {},
  });
  const [selectedBars, setSelectedBars] = useState({
    error: {},
    userByRoom: {},
    deviceByRoom: {},
    deviceByUser: {},
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [showStaticList, setShowStaticList] = useState(false);


  const screenWidth = Dimensions.get('screen').width;
  const chartWidth = screenWidth * 0.92;
  const chartHeight = 300;

  useEffect(() => {
    const unsubscribeUserRoom = onSnapshot(collection(firestore, 'USERS'), (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data());

      const roomCountTempUser = {};

      users.forEach((user) => {
        roomCountTempUser[user.department] = (roomCountTempUser[user.department] || 0) + 1;
      });

      setRoomCountsUser(roomCountTempUser);
    });


    const unsubscribeDeviceRoom = onSnapshot(collection(firestore, 'DEVICES'), (snapshot) => {
      const devices = snapshot.docs.map((doc) => doc.data());

      const roomCountTempDevice = {};

      devices.forEach((device) => {
        roomCountTempDevice[device.departmentName] = (roomCountTempDevice[device.departmentName] || 0) + 1;
      });

      setRoomCountsDevice(roomCountTempDevice);
    });

    const unsubscribeDeviceUser = onSnapshot(collection(firestore, 'DEVICES'), (snapshot) => {
      const devices = snapshot.docs.map((doc) => doc.data());

      const UserCountTempDevice = {};

      devices.forEach((device) => {
        UserCountTempDevice[device.user] = (UserCountTempDevice[device.user] || 0) + 1;
      });

      setUserCount(UserCountTempDevice);
    });

    const unsubscribeErrors = onSnapshot(collection(firestore, 'ERROR'), (snapshot) => {
      const errors = snapshot.docs.map((doc) => doc.data());
      const errorCountTemp = {};

      errors.forEach((error) => {
        errorCountTemp[error.deviceName] = (errorCountTemp[error.deviceName] || 0) + 1;
      });

      setErrorCount(errorCountTemp);
    });

    return () => {
      unsubscribeUserRoom();
      unsubscribeDeviceRoom();
      unsubscribeDeviceUser();
      unsubscribeErrors();
    };
  }, []);

  useEffect(() => {
    const filterAndSortData = (data) => {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filteredData = Object.entries(data).filter(([key]) =>
        key.toLowerCase().includes(lowercaseQuery)
      );
      return Object.fromEntries(
        filteredData.sort(([, a], [, b]) => b - a)
      );
    };

    setFilteredData({
      roomCountsUser: filterAndSortData(roomCountsUser),
      roomCountsDevice: filterAndSortData(roomCountsDevice),
      userCount: filterAndSortData(userCount),
      errorCount: filterAndSortData(errorCount),
    });
  }, [searchQuery, roomCountsUser, roomCountsDevice, userCount, errorCount]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filterAndSortData = (data) => {
      const lowercaseQuery = query.toLowerCase();
      const filteredData = Object.entries(data).filter(([key]) =>
        key.toLowerCase().includes(lowercaseQuery)
      );
      return Object.fromEntries(
        filteredData.sort(([, a], [, b]) => b - a)
      );
    };


    setFilteredData({
      roomCountsUser: filterAndSortData(roomCountsUser),
      roomCountsDevice: filterAndSortData(roomCountsDevice),
      userCount: filterAndSortData(userCount),
      errorCount: filterAndSortData(errorCount),
    });
  };


  const wrapLabel = (label, maxWidth) => {
    const words = label.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    lines.push(currentLine);

    return lines.join('\n');
  };

  const createChartData = (data) => {
    const labels = Object.keys(data);
    const maxLabelWidth = 20; // Áp dụng cho tất cả các biểu đồ
    const wrappedLabels = labels.map(label => wrapLabel(label, maxLabelWidth));
    return {
      labels: wrappedLabels,
      datasets: [
        {
          data: Object.values(data),
          color: (opacity = 1) => `rgba(0, 0, 205, ${opacity})`,
        },
      ],
    };
  };


  const dataErrorDevice = createChartData(filteredData.errorCount);
  const dataRoomCountsUser = createChartData(filteredData.roomCountsUser);
  const dataDeviceRoom = createChartData(filteredData.roomCountsDevice);
  const dataDeviceUser = createChartData(filteredData.userCount);

  const handleChartPress = (chartType, label, value) => {
    const chartData = {
      type: chartType,
      label: label,
      value: value,
      deviceName: chartType === 'error' ? label : null,
      department: ['userByRoom', 'deviceByRoom'].includes(chartType) ? label : null,
      user: chartType === 'deviceByUser' ? label : null
    };
    setSelectedChartData(chartData);
    setModalVisible(true);
  };

  const handleCloseStaticList = () => {
    setShowStaticList(false);
  };

  const handleExportToExcel = (data, title) => {
    Alert.alert(
      "Xuất Excel",
      "Bạn muốn xuất excel bảng thông kê?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Xác nhận", 
          onPress: () => exportToExcel(data, title)
        }
      ]
    );
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Quyền truy cập bộ nhớ",
          message: "Ứng dụng cần quyền truy cập bộ nhớ để lưu file Excel.",
          buttonNeutral: "Hỏi lại sau",
          buttonNegative: "Từ chối",
          buttonPositive: "Đồng ý"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Quyền truy cập bộ nhớ được cấp");
        return true;
      } else {
        console.log("Quyền truy cập bộ nhớ bị từ chối");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const exportToExcel = async (data, title) => {
    console.log('Starting Excel export...');
    try {
      console.log('Preparing Excel data...');
      const additionalData = await fetchAdditionalData(data, title);

      let excelData;
      switch (title) {
        case "Thống kê lỗi theo thiết bị":
          excelData = [
            ['STT', 'Tên thiết bị', 'Phòng', 'Tên người dùng', 'Người báo lỗi', 'Ngày báo cáo', 'Ngày sửa', 'Tình trạng', 'Mô tả', 'Số lỗi'],
            ...additionalData.map((item, index) => [
              index + 1,
              item.deviceName || 'N/A',
              item.deviceRoom || 'N/A',
              item.userName || 'N/A',
              item.reportedBy || 'N/A',
              item.reportDate || 'N/A',
              item.fixDate || 'N/A',
              item.status || 'N/A',
              item.description || 'N/A',
              item.errorCount || 0
            ])
          ];
          break;

        case "Thống kê người dùng theo phòng":
          excelData = [
            ['STT', 'Phòng', 'Số người dùng', 'Tên người dùng', 'Email', 'Vai trò']
          ];
          additionalData.forEach((dept, deptIndex) => {
            if (dept.users.length === 0) {
              excelData.push([deptIndex + 1, dept.department, dept.userCount, 'N/A', 'N/A', 'N/A']);
            } else {
              dept.users.forEach((user, userIndex) => {
                excelData.push([
                  deptIndex + 1,
                  dept.department,
                  dept.userCount,
                  user.name,
                  user.email,
                  user.role
                ]);
              });
            }
          });
          break;

        case "Thống kê thiết bị theo phòng":
          excelData = [
            ['STT', 'Phòng', 'Số thiết bị', 'Tên thiết bị', 'Loại thiết bị', 'Người dùng', 'Email']
          ];
          additionalData.forEach((dept, deptIndex) => {
            dept.devices.forEach((device) => {
              excelData.push([
                deptIndex + 1,
                dept.department,
                dept.deviceCount,
                device.name,
                device.type,
                device.user,
                device.email
              ]);
            });
          });
          break;

        case "Thống kê thiết bị theo người dùng":
          excelData = [
            ['STT', 'Người dùng', 'Email', 'Số thiết bị', 'Tên thiết bị', 'Loại thiết bị', 'Phòng', 'Thông số kỹ thuật', 'Hình ảnh', 'Ghi chú']
          ];
          additionalData.forEach((userInfo, userIndex) => {
            userInfo.devices.forEach((device) => {
              excelData.push([
                userIndex + 1,
                userInfo.user,
                device.email,
                userInfo.deviceCount,
                device.name,
                device.type,
                device.department,
                device.specifications,
                device.image,
                device.note
              ]);
            });
          });
          break;
      }

      console.log('Excel data prepared:', excelData);

      // Tạo workbook và worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Định dạng cột
      const columnWidths = [
        { wch: 5 },  // STT
        { wch: 20 }, 
        { wch: 30 }, // Email
        { wch: 20 }, // Số thiết bị
        { wch: 30 }, 
        { wch: 15 }, // Loại thiết bị
        { wch: 20 }, // Phòng
        { wch: 50 }, // Thông số kỹ thuật
        { wch: 30 }, // Hình ảnh
        { wch: 30 }  // Ghi chú
      ];
      ws['!cols'] = columnWidths;

      // Định dạng hàng tiêu đề
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        ws[address].s = {
          font: { bold: true },
          alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
          fill: { fgColor: { rgb: "FFFFAA00" } }
        };
      }

      // Định dạng các ô dữ liệu
      for (let R = 1; R <= headerRange.e.r; ++R) {
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[address]) continue;
          ws[address].s = {
            alignment: { vertical: 'center', horizontal: 'left', wrapText: true }
          };
        }
      }

      // Tạo file Excel
      const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

      // Lưu file
      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, wbout, 'ascii');

      console.log('File saved successfully');
      Alert.alert('Thành công', `File đã được lưu vào thư mục Downloads với tên ${fileName}`);

    } catch (error) {
      console.error('Error in Excel export:', error);
      Alert.alert('Lỗi', `Có lỗi xảy ra khi xuất file Excel: ${error.message}`);
    }
  };

  const fetchAdditionalData = async (data, title) => {
    const additionalData = [];
    try {
      switch (title) {
        case "Thống kê lỗi theo thiết bị":
          const errorsSnapshot = await getDocs(collection(firestore, 'ERROR'));
          const errors = errorsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));

          for (const error of errors) {
            const deviceQuery = query(
              collection(firestore, 'DEVICES'),
              where('name', '==', error.deviceName)
            );
            const deviceSnapshot = await getDocs(deviceQuery);
            let deviceInfo = null;
            if (!deviceSnapshot.empty) {
              deviceInfo = deviceSnapshot.docs[0].data();
            }

            // Lấy thông tin người dùng
            let userInfo = null;
            if (deviceInfo && deviceInfo.user) {
              const userQuery = query(
                collection(firestore, 'USERS'),
                where('email', '==', deviceInfo.user)
              );
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                userInfo = userSnapshot.docs[0].data();
              }
            }

            // Chuyển đổi ngày từ chuỗi sang định dạng ngày
            const parseDate = (dateString) => {
              const date = new Date(dateString);
              return isNaN(date) ? 'N/A' : date.toLocaleDateString();
            };

            additionalData.push({
              deviceName: error.deviceName,
              deviceRoom: deviceInfo?.departmentName || 'N/A',
              userName: userInfo?.name || deviceInfo?.user || 'N/A',
              reportedBy: error.userreport || 'N/A',
              reportDate: parseDate(error.reportday),
              fixDate: parseDate(error.fixday),
              status: error.state || 'N/A',
              description: error.description || 'N/A',
              errorCount: data.datasets[0].data[data.labels.indexOf(error.deviceName)] || 1
            });
          }
          break;

        case "Thống kê người dùng theo phòng":
          const usersSnapshot = await getDocs(collection(firestore, 'USERS'));
          const users = usersSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
          
          for (const [department, count] of Object.entries(data)) {
            const departmentUsers = users.filter(user => user.department === department);
            additionalData.push({
              department,
              userCount: count,
              users: departmentUsers.map(user => ({
                name: user.fullname || 'N/A',
                email: user.email || 'N/A',
                role: user.role || 'N/A'
              }))
            });
          }
          break;

        case "Thống kê thiết bị theo phòng":
          const devicesSnapshot = await getDocs(collection(firestore, 'DEVICES'));
          const devices = devicesSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
          
          for (const [department, count] of Object.entries(data)) {
            const departmentDevices = devices.filter(device => device.departmentName === department);
            additionalData.push({
              department,
              deviceCount: count,
              devices: departmentDevices.map(device => ({
                name: device.name || 'N/A',
                type: device.type || 'N/A',
                user: device.user || 'N/A',
                email: device.userEmail || 'N/A'
              }))
            });
          }
          break;

        case "Thống kê thiết bị theo người dùng":
          const devicesUserSnapshot = await getDocs(collection(firestore, 'DEVICES'));
          const devicesUser = devicesUserSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
          
          for (const [user, count] of Object.entries(data)) {
            const userDevices = devicesUser.filter(device => device.user === user);
            additionalData.push({
              user,
              deviceCount: count,
              devices: userDevices.map(device => ({
                name: device.name || 'N/A',
                email: device.userEmail || 'N/A',
                type: device.type || 'N/A',
                department: device.departmentName || 'N/A',
                specifications: formatSpecifications(device.specifications), // Sử dụng hàm formatSpecifications ở đây
                image: device.image || 'N/A',
                note: device.note || 'N/A'
              }))
            });
          }
          break;
      }
    } catch (error) {
      console.error("Error fetching additional data: ", error);
    }
    return additionalData;
  };

  const COLUMN_SPACING = 10; // Khoảng cách cố định giữa các cột

  const renderChart = (data, title, chartType) => {
    const totalWidth = Math.max(chartWidth, data.labels.length * 120);
    const availableWidth = totalWidth - (COLUMN_SPACING * (data.labels.length - 1));
    const barWidth = availableWidth / data.labels.length;
    

    return (
        <>
            <View style={styles.legendContainer}>
                <Text style={styles.titleText}>{title}</Text>
                <IconButton
                    icon={({ size, color }) => (
                        <Icon name="microsoft-excel" size={size} color={color} />
                    )}
                    size={24}
                    onPress={() => handleExportToExcel(
                      chartType === "userByRoom" ? filteredData.roomCountsUser :
                      chartType === "deviceByRoom" ? filteredData.roomCountsDevice :
                      chartType === "deviceByUser" ? filteredData.userCount :
                      data,
                      title
                    )}
                    style={styles.exportButton}
                    color={BLUE_COLOR}
                />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <BarChart
                        data={data}
                        width={totalWidth}
                        height={chartHeight}
                        chartConfig={{
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            color: (opacity = 1) => `rgba(0, 0, 205, ${opacity})`,
                            labelColor: (opacity = 1) => BLUE_COLOR,
                            propsForLabels: {
                                fontSize: 8,
                                width: 120,
                                alignmentBaseline: 'middle',
                                fill: BLUE_COLOR,
                            },
                            barPercentage: 1,
                            categoryPercentage: 1,
                        }}
                        verticalLabelRotation={0}
                        horizontalLabelRotation={-45}
                        yAxisLabel=""
                        yAxisSuffix=""
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                        fromZero={true}
                        showValuesOnTopOfBars={true}
                    />
                    <View style={[styles.overlayContainer, { width: totalWidth }]}>
                        {data.labels.map((label, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.overlayLabel,
                                    {
                                        left: index * (barWidth + COLUMN_SPACING),
                                        width: barWidth,
                                        height: chartHeight,
                                    },
                                ]}
                                onPress={() => handleChartPress(chartType, label, data.datasets[0].data[index])}
                            >
                                <View style={styles.touchableArea} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <Divider />
        </>
    );
  };


  return (
    <ScrollView style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={BLUE_COLOR}
        placeholderTextColor={BLUE_COLOR}
        theme={{ colors: { primary: BLUE_COLOR } }}
      />
      {renderChart(dataErrorDevice, "Thống kê lỗi theo thiết bị", "error")}
      {renderChart(dataRoomCountsUser, "Thống kê người dùng theo phòng", "userByRoom")}
      {renderChart(dataDeviceRoom, "Thống kê thiết bị theo phòng", "deviceByRoom")}
      {renderChart(dataDeviceUser, "Thống kê thiết bị theo người dùng", "deviceByUser")}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={{ margin: 0 }}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {selectedChartData && (
            <StaticList
              chartData={selectedChartData}
              onClose={() => setModalVisible(false)} // Ensure this is set correctly
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  legendText: {
    fontSize: 16,
    color: BLUE_COLOR,
  },
  searchBar: {
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  searchBarInput: {
    color: BLUE_COLOR,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BLUE_COLOR,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  overlayLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableArea: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: BLUE_COLOR,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceInfo: {
    fontSize: 14,
    color: 'gray',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: BLUE_COLOR,
  },
  chartContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: BLUE_COLOR,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 40,
    marginLeft: 10,
    marginBottom: 50, 
  },
  touchableBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50, 
    paddingLeft: 30,
  },
  touchableBar: {
    height: '100%',
    width: 60, 
  },
  exportButton: {
    margin: 0,
  },
  exportButtonLabel: {
    color: 'white',
    fontSize: 12,
  },
});
export default Statistic;