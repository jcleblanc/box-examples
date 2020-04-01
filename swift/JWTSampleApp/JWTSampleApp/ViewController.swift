//
//  ViewController.swift
//  JWTSampleApp-carthage
//
//  Created by Martina Stremenova on 28/06/2019.
//  Copyright © 2019 Box. All rights reserved.
//

import BoxSDK
import UIKit

class ViewController: UITableViewController {

    private var sdk: BoxSDK!
    private var client: BoxClient!
    private var folderItems: [FolderItem] = []

    private lazy var dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM dd,yyyy at HH:mm a"
        return formatter
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        setUpBoxSDK()
        setUpUI()
    }

    // MARK: - Actions

    @objc private func loginButtonPressed() {
        authorizeWithJWClient()
    }

    @objc private func loadItemsButtonPressed() {
        getRootFolderItems()
    }

    // MARK: - Set up

    private func setUpBoxSDK() {
        sdk = BoxSDK(
            clientId: Constants.clientID,
            clientSecret: Constants.clientSecret
        )
    }

    private func setUpUI() {
        title = "JWT Example"
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Login", style: .plain, target: self, action: #selector(loginButtonPressed))
        tableView.tableFooterView = UIView()
    }
}

// MARK: - TableView

extension ViewController {
    override func numberOfSections(in _: UITableView) -> Int {
        return 1
    }

    override func tableView(_: UITableView, numberOfRowsInSection _: Int) -> Int {
        return folderItems.count
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let item = folderItems[indexPath.row]
        let cell = tableView.dequeueReusableCell(withIdentifier: "ItemCell", for: indexPath)
        cell.textLabel?.numberOfLines = 0
        switch item.itemValue {
        case let .file(file):
            cell.textLabel?.text = file.name
            cell.detailTextLabel?.text = String(format: "Date Modified %@", dateFormatter.string(from: file.modifiedAt ?? Date()))
            cell.accessoryType = .none
        case let .folder(folder):
            cell.textLabel?.text = folder.name
            cell.detailTextLabel?.text = String(format: "Date Modified %@", dateFormatter.string(from: folder.modifiedAt ?? Date()))
            cell.accessoryType = .disclosureIndicator
            cell.imageView?.image = UIImage(named: "folder")
        default:
            break
        }
        return cell
    }
}

// MARK: - Loading items

private extension ViewController {

    func getRootFolderItems() {
        let iterator: PaginationIterator<FolderItem> = client.folders.getFolderItems(
            folderId: "0",
            usemarker: true,
            fields: ["modified_at", "name"]
        )
        iterator.nextItems { [weak self] result in
            switch result {
            case let .failure(error):
                print(error)
            case let .success(items):
                self?.folderItems = items
                DispatchQueue.main.async {
                    self?.tableView.reloadData()
                    self?.navigationItem.rightBarButtonItem?.title = "Refresh"
                }
            }
        }
    }
}

// MARK: - JWT Helpers

private extension ViewController {

    func authorizeWithJWClient() {
        #warning("Get uniqueID from your server. It's a way for your server to identify the app it's generating JWT token for.")
        sdk.getDelegatedAuthClient(authClosure: obtainJWTTokenFromExternalSources(), uniqueID: "dummyID") { [weak self] result in
            switch result {
            case let .success(client):
                guard let self = self else { return }
                self.client = client
                self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Load items", style: .plain, target: self, action: #selector(self.loadItemsButtonPressed))
            case let .failure(error):
                print(error)
            }
        }
    }

    func obtainJWTTokenFromExternalSources() -> DelegatedAuthClosure {
        return { uniqueID, completion in
            // The code below is an example implementation of the delegate function — please provide your own
            // implementation
            
             let session = URLSession(configuration: .default)
            
             //REPLACE WITH YOUR HEROKU APPLICATION LINK
             let tokenUrl = "https://myapp.herokuapp.com/"
             let urlRequest = URLRequest(url: URL(string: tokenUrl)!)

             let task = session.dataTask(with: urlRequest) { data, response, error in
                 if let unwrappedError = error {
                     print(error.debugDescription)
                     completion(.failure(unwrappedError))
                     return
                 }

                 if let body = data, let token = String(data: body, encoding: .utf8) {
                     print("\nFetched new token: \(token)\n")
                     completion(.success((accessToken: token, expiresIn: 999)))
                 }
                 else {
                     completion(.failure(BoxError.tokenRetrieval))
                 }
             }
             task.resume()
        }
    }
}
