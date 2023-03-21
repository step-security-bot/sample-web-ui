/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Component, OnInit, ViewChild } from '@angular/core'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { Router } from '@angular/router'
import { finalize } from 'rxjs/operators'
import { PageEventOptions } from 'src/models/models'
import { AreYouSureDialogComponent } from '../shared/are-you-sure/are-you-sure.component'
import SnackbarDefaults from '../shared/config/snackBarDefault'
import { WirelessService } from './wireless.service'
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator'
import { AuthenticationMethods, Config, EncryptionMethods } from './wireless.constants'

@Component({
  selector: 'app-wireless',
  templateUrl: './wireless.component.html',
  styleUrls: ['./wireless.component.scss']
})
export class WirelessComponent implements OnInit {
  configs: Config[] = []
  isLoading = true
  totalCount: number = 0
  displayedColumns: string[] = ['name', 'authmethod', 'encryptionMethod', 'ssid', 'remove']
  authenticationMethods = AuthenticationMethods
  encryptionMethods = EncryptionMethods
  pageEvent: PageEventOptions = {
    pageSize: 25,
    startsFrom: 0,
    count: 'true'
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor (public snackBar: MatSnackBar, public readonly wirelessService: WirelessService, public router: Router, public dialog: MatDialog) { }

  ngOnInit (): void {
    this.getData(this.pageEvent)
  }

  getData (pageEvent: PageEventOptions): void {
    this.wirelessService
      .getData(pageEvent)
      .pipe(
        finalize(() => {
          this.isLoading = false
        })
      )
      .subscribe({
        next: (rsp) => {
          this.configs = rsp.data
          this.totalCount = rsp.totalCount
        },
        error: () => {
          this.snackBar.open($localize`Unable to load configurations`, undefined, SnackbarDefaults.defaultError)
        }
      })
  }

  isNoData (): boolean {
    return !this.isLoading && this.configs.length === 0
  }

  delete (name: string): void {
    const dialogRef = this.dialog.open(AreYouSureDialogComponent)

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true
        this.wirelessService
          .delete(name)
          .pipe(
          finalize(() => {
            this.isLoading = false
          })
        )
          .subscribe({
             next: () => {
              this.getData(this.pageEvent)
              this.snackBar.open($localize`Configuration deleted successfully`, undefined, SnackbarDefaults.defaultSuccess)
            },
            error: err => {
              if (err?.length > 0) {
                this.snackBar.open(err, undefined, SnackbarDefaults.longError)
              } else {
                this.snackBar.open($localize`Unable to delete configuration`, undefined, SnackbarDefaults.defaultError)
              }
            }
          })
      }
    })
  }

  pageChanged (event: PageEvent): void {
    this.pageEvent = {
      ...this.pageEvent,
      pageSize: event.pageSize,
      startsFrom: event.pageIndex * event.pageSize
    }
    this.getData(this.pageEvent)
  }

  async navigateTo (path: string = 'new'): Promise<void> {
    await this.router.navigate([`/wireless/${path}`])
  }
}
